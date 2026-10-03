export type MealResponse = {
  uid: string;
  choice: string;
};

export function calculateMealParticipationPercentage(
  totalStudents: number,
  responses: MealResponse[],
): number {
  if (totalStudents <= 0) return 0;

  const participants = new Set(
    responses
      .filter(({ uid, choice }) => uid && (choice === "yes" || choice === "custom"))
      .map(({ uid }) => uid),
  );
  return Math.round((participants.size / totalStudents) * 100);
}
