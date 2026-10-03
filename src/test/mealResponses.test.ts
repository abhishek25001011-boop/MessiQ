import { describe, expect, it } from "vitest";
import {
  buildDailyResponseAnalytics,
  buildMealResponseRows,
  calculateMealResponseStats,
  exportMealResponsesToCSV,
  getChoiceLabel,
  getDateRange,
  getPaymentStatus,
  type MealResponseStudent,
} from "@/lib/mealResponses";

const students: MealResponseStudent[] = [
  { uid: "s1", name: "Asha, Rao", email: 'asha"rao@example.com', paymentStatus: "unpaid" },
  { uid: "s2", name: "Sam", email: "sam@example.com", paymentStatus: "paid" },
];

describe("meal response calculations", () => {
  it("maps stored choice values and keeps no response distinct from skipped", () => {
    expect(getChoiceLabel("yes")).toBe("Yes");
    expect(getChoiceLabel("custom")).toBe("Custom");
    expect(getChoiceLabel("no")).toBe("Skipped");
    expect(getChoiceLabel()).toBe("No response");
    const rows = buildMealResponseRows(students, [
      { uid: "s1", mealType: "breakfast", choice: "no" },
      { uid: "s1", mealType: "lunch", choice: "yes" },
      { uid: "s2", mealType: "dinner", choice: "custom" },
    ]);
    expect(rows[0].breakfast).toBe("Skipped");
    expect(rows[0].snacks).toBe("No response");
    expect(rows[1].dinner).toBe("Custom");
  });

  it("counts requested meals as yes plus custom and counts missing slots as no response", () => {
    const rows = buildMealResponseRows(students, [
      { uid: "s1", mealType: "breakfast", choice: "yes" },
      { uid: "s1", mealType: "lunch", choice: "custom" },
      { uid: "s1", mealType: "snacks", choice: "no" },
    ]);
    expect(calculateMealResponseStats(rows)).toEqual({
      yes: 1, custom: 1, skipped: 1, noResponse: 5, totalResponses: 3, requestedMeals: 2,
    });
  });

  it("applies date presets and custom date filtering boundaries", () => {
    expect(getDateRange("7days", "2026-10-03", "", "")).toEqual({ start: "2026-09-27", end: "2026-10-03" });
    expect(getDateRange("yesterday", "2026-10-03", "", "")).toEqual({ start: "2026-10-02", end: "2026-10-02" });
    expect(getDateRange("custom", "2026-10-03", "2026-09-01", "2026-09-10")).toEqual({ start: "2026-09-01", end: "2026-09-10" });
  });

  it("does not add historical dates without Firestore records", () => {
    const analytics = buildDailyResponseAnalytics(students, [
      { uid: "s1", date: "2026-10-02", mealType: "breakfast", choice: "yes" },
      { uid: "s2", date: "2026-10-04", mealType: "dinner", choice: "no" },
    ]);
    expect(analytics.map(({ date }) => date)).toEqual(["2026-10-02", "2026-10-04"]);
    expect(analytics[0].requested).toBe(1);
    expect(analytics[1].skipped).toBe(1);
  });

  it("escapes commas, quotes, and newlines in CSV cells", () => {
    const [header, student] = exportMealResponsesToCSV("2026-10-03", [{
      ...students[0], name: "Asha, Rao\nResident", breakfast: "Yes", lunch: "Custom", snacks: "Skipped", dinner: "No response",
    }]).split("\r\n");
    expect(header).toBe("Date,Student Name,Student Email,Breakfast,Lunch,Snacks,Dinner,Payment Status");
    expect(student).toContain('"Asha, Rao\nResident"');
    expect(student).toContain('"asha""rao@example.com"');
  });

  it("defaults missing payment status to unpaid", () => {
    expect(getPaymentStatus(undefined)).toBe("unpaid");
    expect(getPaymentStatus("invalid")).toBe("unpaid");
    expect(getPaymentStatus("paid")).toBe("paid");
  });
});
