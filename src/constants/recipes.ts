/**
 * Dataset de recetas — local y estático a propósito (sin backend de recetas
 * real): lo que hace falta para el prototipo es la mecánica de swipe + el
 * plan generado, no un catálogo real de recetas. Precio estimado en GBP por
 * receta (para el nº de comensales indicado) — aproximado, suficiente para
 * que el plan pueda razonar sobre presupuesto.
 *
 * `photo` es un par de colores (degradado) — se usa como tinte de marca sobre
 * la foto y como fondo de respaldo si la foto no carga (sin red, etc.).
 * `photoQuery` son las palabras clave para pedir una foto de comida real
 * (ver swipe-card.tsx) — de ahí sale la imagen, no de un banco propio.
 */

export type Recipe = {
  id: string;
  title: string;
  emoji: string;
  tags: string[];
  estimatedCostGBP: number;
  servings: number;
  minutes: number;
  ingredients: string[];
  photo: readonly [string, string];
  photoQuery: string;
};

export const RECIPES: Recipe[] = [
  { id: 'r1', title: 'Chicken Tikka Masala', emoji: '🍛', tags: ['meat', 'spicy'], estimatedCostGBP: 8, servings: 4, minutes: 35, ingredients: ['chicken breast', 'tomato passata', 'yoghurt', 'garam masala', 'basmati rice'], photo: ['#FF8A5B', '#FF3E7F'], photoQuery: 'chicken-tikka-masala,curry' },
  { id: 'r2', title: 'Veggie Stir Fry', emoji: '🥦', tags: ['vegetarian', 'quick'], estimatedCostGBP: 5, servings: 2, minutes: 20, ingredients: ['broccoli', 'bell pepper', 'soy sauce', 'noodles', 'tofu'], photo: ['#8BC34A', '#2E9E5B'], photoQuery: 'stirfry'},
  { id: 'r3', title: 'Salmon Traybake', emoji: '🐟', tags: ['fish', 'healthy'], estimatedCostGBP: 9, servings: 4, minutes: 30, ingredients: ['salmon fillet', 'new potatoes', 'asparagus', 'lemon'], photo: ['#FF7A59', '#E5484D'], photoQuery: 'bakedsalmon'},
  { id: 'r4', title: 'Beef Tacos', emoji: '🌮', tags: ['meat', 'quick'], estimatedCostGBP: 7, servings: 4, minutes: 25, ingredients: ['beef mince', 'taco shells', 'cheddar', 'lettuce', 'salsa'], photo: ['#FFB020', '#FF3E7F'], photoQuery: 'streettacos,beef'},
  { id: 'r5', title: 'Lentil Dahl', emoji: '🍲', tags: ['vegan', 'budget'], estimatedCostGBP: 3, servings: 4, minutes: 30, ingredients: ['red lentils', 'coconut milk', 'onion', 'turmeric', 'rice'], photo: ['#F5A623', '#D9822B'], photoQuery: 'dal,lentilsoup' },
  { id: 'r6', title: 'Margherita Pizza', emoji: '🍕', tags: ['vegetarian', 'quick'], estimatedCostGBP: 4, servings: 2, minutes: 20, ingredients: ['pizza base', 'mozzarella', 'tomato sauce', 'basil'], photo: ['#FF3E7F', '#FFB020'], photoQuery: 'margheritapizza' },
  { id: 'r7', title: 'Thai Green Curry', emoji: '🍛', tags: ['spicy', 'quick'], estimatedCostGBP: 7, servings: 4, minutes: 25, ingredients: ['chicken thigh', 'green curry paste', 'coconut milk', 'green beans', 'rice'], photo: ['#4CAF6D', '#1E8E6B'], photoQuery: 'thaicurry'},
  { id: 'r8', title: 'Halloumi Salad', emoji: '🥗', tags: ['vegetarian', 'healthy'], estimatedCostGBP: 6, servings: 2, minutes: 15, ingredients: ['halloumi', 'mixed leaves', 'cherry tomatoes', 'balsamic'], photo: ['#8BC34A', '#F5A623'], photoQuery: 'halloumi,salad' },
  { id: 'r9', title: 'Spaghetti Bolognese', emoji: '🍝', tags: ['meat', 'family'], estimatedCostGBP: 5, servings: 4, minutes: 40, ingredients: ['beef mince', 'spaghetti', 'tomato passata', 'onion', 'parmesan'], photo: ['#E5484D', '#FF7A59'], photoQuery: 'spaghettibolognese' },
  { id: 'r10', title: 'Chickpea Curry', emoji: '🍲', tags: ['vegan', 'budget'], estimatedCostGBP: 3, servings: 4, minutes: 30, ingredients: ['chickpeas', 'tomato', 'garam masala', 'onion', 'rice'], photo: ['#FFB020', '#D9822B'], photoQuery: 'chanamasala'},
  { id: 'r11', title: 'Fish and Chips', emoji: '🍟', tags: ['fish', 'family'], estimatedCostGBP: 8, servings: 4, minutes: 35, ingredients: ['cod fillet', 'potatoes', 'peas', 'flour'], photo: ['#FF7A59', '#FFB020'], photoQuery: 'battered-fish'},
  { id: 'r12', title: 'Mushroom Risotto', emoji: '🍚', tags: ['vegetarian', 'healthy'], estimatedCostGBP: 6, servings: 2, minutes: 40, ingredients: ['arborio rice', 'mushrooms', 'parmesan', 'white wine', 'stock'], photo: ['#B08968', '#8B5E34'], photoQuery: 'mushroomrisotto' },
  { id: 'r13', title: 'Pulled Pork Buns', emoji: '🥪', tags: ['meat', 'family'], estimatedCostGBP: 7, servings: 4, minutes: 45, ingredients: ['pork shoulder', 'bbq sauce', 'brioche buns', 'coleslaw'], photo: ['#D9822B', '#E5484D'], photoQuery: 'pulledpork,bun'},
  { id: 'r14', title: 'Falafel Wrap', emoji: '🌯', tags: ['vegan', 'quick'], estimatedCostGBP: 4, servings: 2, minutes: 15, ingredients: ['chickpeas', 'tortilla wrap', 'hummus', 'cucumber', 'tomato'], photo: ['#8BC34A', '#4CAF6D'], photoQuery: 'falafelsandwich'},
  { id: 'r15', title: 'Prawn Linguine', emoji: '🍤', tags: ['fish', 'quick'], estimatedCostGBP: 8, servings: 2, minutes: 25, ingredients: ['king prawns', 'linguine', 'garlic', 'chilli', 'parsley'], photo: ['#FF3E7F', '#E5484D'], photoQuery: 'prawnpasta'},
  { id: 'r16', title: 'Sausage Traybake', emoji: '🌭', tags: ['meat', 'budget', 'family'], estimatedCostGBP: 5, servings: 4, minutes: 40, ingredients: ['sausages', 'potatoes', 'red onion', 'peppers'], photo: ['#D9822B', '#FFB020'], photoQuery: 'sausages,potatoes'},
];
