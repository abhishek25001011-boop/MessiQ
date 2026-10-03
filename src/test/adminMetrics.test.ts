import { describe, expect, it } from "vitest";
import { calculateMealParticipationPercentage } from "@/lib/adminMetrics";

describe("meal participation metric", () => {
  it("counts unique students choosing Yes or Custom, not No responses", () => {
    const percentage = calculateMealParticipationPercentage(4, [
      { uid: "student-1", choice: "yes" },
      { uid: "student-1", choice: "custom" },
      { uid: "student-2", choice: "custom" },
      { uid: "student-3", choice: "no" },
    ]);

    expect(percentage).toBe(50);
  });

  it("returns zero when there are no students", () => {
    expect(calculateMealParticipationPercentage(0, [
      { uid: "student-1", choice: "yes" },
    ])).toBe(0);
  });
});
