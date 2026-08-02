/**
 * Servidor mínimo para MealSwipe — un único endpoint que convierte "recetas
 * que le gustaron al usuario + preferencias del hogar" en un plan semanal +
 * lista de la compra. Mismo criterio que Aithority: la key de Claude vive
 * solo aquí (nunca en el bundle de la app), y si no hay key configurada,
 * se cae a un plan determinista en vez de fallar en seco.
 */

import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Plan simple sin LLM: reparte las recetas que le gustaron por los 7 días
 *  (repitiendo si hace falta) y suma ingredientes/coste. Siempre funciona. */
function planDeterminista(liked, household) {
  const days = DAYS.map((day, i) => ({ day, recipeTitle: liked[i % liked.length].title }))
  const usadas = new Set(days.map((d) => d.recipeTitle))
  const recetasUsadas = liked.filter((r) => usadas.has(r.title))
  const shoppingList = [...new Set(recetasUsadas.flatMap((r) => r.ingredients))]
  const totalEstimatedCostGBP = days.reduce((sum, d) => {
    const r = liked.find((x) => x.title === d.recipeTitle)
    return sum + (r?.estimatedCostGBP || 0)
  }, 0)
  return {
    summary: `A simple weekly rotation of your ${liked.length} liked recipes for ${household.servings} people.`,
    days,
    shoppingList,
    totalEstimatedCostGBP,
  }
}

async function planConLLM(liked, household) {
  const recetasTxt = liked
    .map((r) => `- ${r.title} (£${r.estimatedCostGBP}, ${r.tags.join('/')}): ${r.ingredients.join(', ')}`)
    .join('\n')

  const system = `You are a meal-planning assistant. Given a list of recipes the user liked and their household preferences, build a 7-day plan (Monday to Sunday) using ONLY the given recipes (repeat if needed), respecting diet and staying close to budget. Return ONLY a JSON object, no surrounding text, with this exact shape:
{
  "summary": "<one sentence>",
  "days": [{"day": "Monday", "recipeTitle": "<exact title from the list>"}, ...7 entries...],
  "shoppingList": ["<consolidated ingredient>", ...],
  "totalEstimatedCostGBP": <number>
}`

  const user = `Household: ${household.servings} servings, £${household.budgetGBP}/week budget, diet: ${household.diet}.

Liked recipes:
${recetasTxt}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('El LLM no devolvió JSON.')
  return JSON.parse(match[0])
}

/**
 * "Budget Coach" — lo que Mealia no enseña en sus capturas: no solo genera el
 * plan, cuando se pasa de presupuesto propone un cambio CONCRETO con el
 * ahorro calculado, en vez de dejar que el usuario lo descubra al pagar.
 * Se aplica sobre el resultado final venga de donde venga (LLM o
 * determinista) — es una capa de razonamiento aparte, no una feature del
 * generador de planes.
 */
function computeBudgetTip(plan, liked, household) {
  if (!plan || plan.totalEstimatedCostGBP <= household.budgetGBP) return null

  const priceOf = (title) => liked.find((r) => r.title === title)?.estimatedCostGBP ?? 0
  const usedTitles = [...new Set(plan.days.map((d) => d.recipeTitle))]
  if (usedTitles.length < 2) return null

  const from = usedTitles.reduce((a, b) => (priceOf(a) >= priceOf(b) ? a : b))
  const to = usedTitles.filter((t) => t !== from).reduce((a, b) => (priceOf(a) <= priceOf(b) ? a : b))
  const savingsGBP = priceOf(from) - priceOf(to)
  if (savingsGBP <= 0) return null

  const day = plan.days.find((d) => d.recipeTitle === from)?.day
  if (!day) return null

  return {
    day,
    from,
    to,
    savingsGBP,
    message: `You're £${(plan.totalEstimatedCostGBP - household.budgetGBP).toFixed(2)} over budget. Swap ${day}'s ${from} for ${to} to save £${savingsGBP}.`,
  }
}

app.post('/generate-plan', async (req, res) => {
  const { liked, household } = req.body || {}
  if (!Array.isArray(liked) || liked.length === 0) {
    return res.status(400).json({ error: 'liked debe ser un array con al menos una receta.' })
  }
  const hh = { servings: 2, budgetGBP: 40, diet: 'none', ...household }

  let plan
  if (!ANTHROPIC_KEY) {
    plan = planDeterminista(liked, hh)
  } else {
    try {
      plan = await planConLLM(liked, hh)
    } catch (err) {
      // No se rompe la demo: si el LLM falla, plan determinista de respaldo.
      console.error('planConLLM falló, usando fallback determinista:', err.message)
      plan = planDeterminista(liked, hh)
    }
  }

  plan.budgetTip = computeBudgetTip(plan, liked, hh)
  res.json(plan)
})

/**
 * Chat de IA — lo que Mealia sí tiene y nosotros no teníamos: pedir
 * sustituciones, ideas rápidas o consejo de cocina en lenguaje natural.
 * Usa las recetas que le gustaron al usuario como contexto para que las
 * respuestas sean relevantes a su plan, no genéricas.
 */
app.post('/chat', async (req, res) => {
  const { messages, liked } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages debe ser un array con al menos un mensaje.' })
  }
  if (!ANTHROPIC_KEY) {
    return res.status(503).json({ error: 'No hay ANTHROPIC_API_KEY configurada en el servidor.' })
  }

  const likedTxt = (liked || []).map((r) => r.title).join(', ') || 'none yet'
  const system = `You are MealSwipe's cooking assistant. Help with ingredient substitutions, quick recipe ideas, and cooking tips. Be concise — 2-4 sentences unless asked for a full recipe. Plain text only, no markdown formatting (no asterisks, no bullet points). The user's currently liked recipes are: ${likedTxt}.`

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    if (!apiRes.ok) throw new Error(`Anthropic (${apiRes.status}): ${(await apiRes.text()).slice(0, 200)}`)
    const data = await apiRes.json()
    const reply = data.content?.[0]?.text || "Sorry, I couldn't come up with anything."
    res.json({ reply })
  } catch (err) {
    console.error('chat falló:', err.message)
    res.status(502).json({ error: 'Could not reach the assistant right now.' })
  }
})

app.get('/health', (_req, res) => res.json({ ok: true }))

const PORT = Number(process.env.PORT || 4001)
app.listen(PORT, () => console.log(`mealswipe-server escuchando en http://localhost:${PORT}`))
