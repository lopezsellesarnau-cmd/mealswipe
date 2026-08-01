import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Recipe } from '@/constants/recipes';

export type Household = {
  servings: number;
  budgetGBP: number;
  diet: 'none' | 'vegetarian' | 'vegan';
};

export type BudgetTip = {
  day: string;
  from: string;
  to: string;
  savingsGBP: number;
  message: string;
};

export type GeneratedPlan = {
  summary: string;
  days: { day: string; recipeTitle: string }[];
  shoppingList: string[];
  totalEstimatedCostGBP: number;
  budgetTip: BudgetTip | null;
};

type MealPlanContextValue = {
  household: Household;
  setHousehold: (h: Household) => void;
  liked: Recipe[];
  toggleLike: (recipe: Recipe) => void;
  plan: GeneratedPlan | null;
  setPlan: (p: GeneratedPlan | null) => void;
};

const MealPlanContext = createContext<MealPlanContextValue | null>(null);

export function MealPlanProvider({ children }: PropsWithChildren) {
  const [household, setHousehold] = useState<Household>({ servings: 2, budgetGBP: 40, diet: 'none' });
  const [liked, setLiked] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const value = useMemo<MealPlanContextValue>(
    () => ({
      household,
      setHousehold,
      liked,
      toggleLike: (recipe) => {
        setLiked((current) =>
          current.some((r) => r.id === recipe.id)
            ? current.filter((r) => r.id !== recipe.id)
            : [...current, recipe],
        );
      },
      plan,
      setPlan,
    }),
    [household, liked, plan],
  );

  return <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>;
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}
