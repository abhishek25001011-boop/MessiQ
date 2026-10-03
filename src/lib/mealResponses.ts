export const mealTypes = ["breakfast", "lunch", "snacks", "dinner"] as const;
export type MealType = (typeof mealTypes)[number];
export type MealChoice = "yes" | "custom" | "no";
export type MealResponseLabel = "Yes" | "Custom" | "Skipped" | "No response";
export type PaymentStatus = "paid" | "unpaid";

export function getPaymentStatus(value: unknown): PaymentStatus {
  return value === "paid" ? "paid" : "unpaid";
}

export interface MealResponseStudent {
  uid: string;
  name: string;
  email: string;
  paymentStatus: PaymentStatus;
}

export interface MealResponseRecord {
  uid: string;
  mealType: MealType;
  choice: MealChoice;
}

export interface MealResponseRow extends MealResponseStudent {
  breakfast: MealResponseLabel;
  lunch: MealResponseLabel;
  snacks: MealResponseLabel;
  dinner: MealResponseLabel;
}

export interface MealResponseStats {
  yes: number;
  custom: number;
  skipped: number;
  noResponse: number;
  totalResponses: number;
  requestedMeals: number;
}

export function getChoiceLabel(choice?: MealChoice): MealResponseLabel {
  if (choice === "yes") return "Yes";
  if (choice === "custom") return "Custom";
  if (choice === "no") return "Skipped";
  return "No response";
}

export function buildMealResponseRows(
  students: MealResponseStudent[],
  records: MealResponseRecord[],
): MealResponseRow[] {
  const byStudentMeal = new Map(records.map((record) => [`${record.uid}:${record.mealType}`, record.choice]));
  return students.map((student) => ({
    ...student,
    breakfast: getChoiceLabel(byStudentMeal.get(`${student.uid}:breakfast`)),
    lunch: getChoiceLabel(byStudentMeal.get(`${student.uid}:lunch`)),
    snacks: getChoiceLabel(byStudentMeal.get(`${student.uid}:snacks`)),
    dinner: getChoiceLabel(byStudentMeal.get(`${student.uid}:dinner`)),
  }));
}

export function calculateMealResponseStats(rows: MealResponseRow[]): MealResponseStats {
  const stats: MealResponseStats = {
    yes: 0, custom: 0, skipped: 0, noResponse: 0, totalResponses: 0, requestedMeals: 0,
  };
  for (const row of rows) {
    for (const type of mealTypes) {
      const label = row[type];
      if (label === "Yes") stats.yes += 1;
      else if (label === "Custom") stats.custom += 1;
      else if (label === "Skipped") stats.skipped += 1;
      else stats.noResponse += 1;
    }
  }
  stats.totalResponses = stats.yes + stats.custom + stats.skipped;
  stats.requestedMeals = stats.yes + stats.custom;
  return stats;
}

export function getDateRange(preset: "today" | "yesterday" | "7days" | "30days" | "custom", today: string, customStart: string, customEnd: string) {
  if (preset === "custom") return { start: customStart, end: customEnd };
  const endDate = new Date(`${today}T00:00:00`);
  if (preset === "yesterday") endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date(endDate);
  if (preset === "7days") startDate.setDate(startDate.getDate() - 6);
  if (preset === "30days") startDate.setDate(startDate.getDate() - 29);
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { start: format(startDate), end: format(endDate) };
}

export function buildDailyResponseAnalytics(
  students: MealResponseStudent[],
  records: Array<MealResponseRecord & { date: string }>,
) {
  const dates = [...new Set(records.map(({ date }) => date))].sort();
  return dates.map((date) => {
    const dateRows = buildMealResponseRows(
      students,
      records.filter((record) => record.date === date),
    );
    const stats = calculateMealResponseStats(dateRows);
    return { date, requested: stats.requestedMeals, skipped: stats.skipped, custom: stats.custom, noResponse: stats.noResponse };
  });
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportMealResponsesToCSV(date: string, rows: MealResponseRow[]): string {
  const headers = ["Date", "Student Name", "Student Email", "Breakfast", "Lunch", "Snacks", "Dinner", "Payment Status"];
  const lines = rows.map((row) => [date, row.name, row.email, row.breakfast, row.lunch, row.snacks, row.dinner, row.paymentStatus].map(escapeCsv).join(","));
  return [headers.join(","), ...lines].join("\r\n");
}
