export interface MealSelectionData {
  date: string;
  selections: Record<
    string,
    {
      choice: "yes" | "no" | "custom";
      customNote: string;
    }
  >;
}

export interface FeedbackData {
  rating: number;
  text: string;
  date: string;
}

const MEAL_KEY = "messiq-meals";
const FEEDBACK_KEY = "messiq-feedback";

// ======================
// Meal Storage
// ======================

export function saveMealSelection(data: MealSelectionData) {
  localStorage.setItem(MEAL_KEY, JSON.stringify(data));
}

export function getMealSelection(): MealSelectionData | null {
  const data = localStorage.getItem(MEAL_KEY);

  if (!data) return null;

  return JSON.parse(data);
}
// ======================
// AI Prediction
// ======================

export function getPredictedMeals() {
  const selected = getSelectedMealCount();

  if (selected === 0) return 0;

  return Math.round(selected * 1.05);
}

export function getWasteEstimate() {
  const selected = getSelectedMealCount();

  return Number((selected * 0.25).toFixed(1));
}

export function getTodayRevenue() {
  const selected = getSelectedMealCount();

  return selected * 60;
}
// ======================
// Feedback Storage
// ======================

export function saveFeedback(data: FeedbackData) {
  const existing = getFeedback();

  existing.push(data);

  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(existing));
}

export function getFeedback(): FeedbackData[] {
  const data = localStorage.getItem(FEEDBACK_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

// ======================
// Dashboard Stats
// ======================

export function getSelectedMealCount() {
  const meal = getMealSelection();

  if (!meal) return 0;

  return Object.values(meal.selections).filter(
    (m) => m.choice !== "no"
  ).length;
}
export function getIngredientEstimate() {
  const meals = getPredictedMeals();

  return {
    rice: `${Math.ceil(meals * 0.15)} kg`,
    dal: `${Math.ceil(meals * 0.05)} kg`,
    vegetables: `${Math.ceil(meals * 0.12)} kg`,
    paneer: `${Math.ceil(meals * 0.04)} kg`,
    oil: `${Math.ceil(meals * 0.02)} L`,
  };
}

export function getKitchenAlerts() {
  const meals = getPredictedMeals();

  return [
    `Prepare ${meals} meals today`,
    "Check dal stock before lunch",
    "Vegetables should be washed before 10 AM",
    "Keep 5% extra meals for emergencies",
  ];
}