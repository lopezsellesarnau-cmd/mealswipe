# MealSwipe

A weekend prototype — Tinder-style recipe swiping that builds a personalized
weekly meal plan + shopping list. Built to explore the same product space as
[Mealia](https://www.mealia.co.uk/) (AI grocery assistant), with an agentic
twist: an LLM layer reasons over the user's liked recipes and household
constraints (budget, servings, diet) instead of just picking randomly.

## Architecture

Two pieces, same two-layer pattern I use across my other projects (rules/data
first, LLM reasons on top of it — never the other way round):

- **`src/`** — Expo (React Native) app. Swipe screen → household form → plan
  screen. State is a lightweight React Context (`src/state/meal-plan.tsx`), no
  backend needed for the swiping itself — recipes are a static local dataset
  (`src/constants/recipes.ts`).
- **`server/`** — a tiny Express server with one endpoint,
  `POST /generate-plan`. It takes the liked recipes + household prefs and
  returns a 7-day plan + consolidated shopping list. With `ANTHROPIC_API_KEY`
  set, Claude reasons over the constraints; without it, it falls back to a
  deterministic rotation — the app never breaks just because the key is
  missing.

The Claude key lives only on the server, never in the app bundle.

## Run it

```bash
# app
npm install
npx expo start --ios   # or --android / --web

# server (separate terminal)
cd server
npm install
cp .env.example .env   # optionally add ANTHROPIC_API_KEY
npm run dev
```

The app expects the server at `http://localhost:4001` by default — override
with `EXPO_PUBLIC_API_URL` if testing on a physical device (use your LAN IP,
not `localhost`).

## Stack

React Native (Expo), TypeScript, `react-native-gesture-handler` +
`react-native-reanimated` for the swipe mechanic, Node/Express, Claude API.
