export type AppRole = "admin" | "student";

export function hasRequiredRole(
  actualRole: string | null | undefined,
  requiredRole: AppRole,
): boolean {
  return actualRole === requiredRole;
}

export function isFeedbackOwner(
  authenticatedUid: string | null | undefined,
  feedbackUid: string | null | undefined,
): boolean {
  return Boolean(authenticatedUid) && authenticatedUid === feedbackUid;
}

export function filterNavigationItems<T extends { url: string }>(
  items: T[],
  role: AppRole | null,
): T[] {
  return items.filter(({ url }) => {
    if (url === "/meals" || url === "/feedback") return role === "student";
    if (["/admin", "/predictions", "/waste", "/revenue"].includes(url)) {
      return role === "admin";
    }
    return true;
  });
}
