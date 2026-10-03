import { describe, expect, it } from "vitest";
import {
  filterNavigationItems,
  hasRequiredRole,
  isFeedbackOwner,
} from "@/lib/accessControl";

const navigation = [
  { url: "/dashboard" },
  { url: "/meals" },
  { url: "/feedback" },
  { url: "/admin" },
  { url: "/predictions" },
  { url: "/waste" },
  { url: "/revenue" },
  { url: "/profile" },
];

describe("role access and navigation", () => {
  it("allows only the matching role through a protected route", () => {
    expect(hasRequiredRole("student", "student")).toBe(true);
    expect(hasRequiredRole("admin", "student")).toBe(false);
    expect(hasRequiredRole("student", "admin")).toBe(false);
    expect(hasRequiredRole(undefined, "admin")).toBe(false);
  });

  it("shows student-only links only to students", () => {
    const studentLinks = filterNavigationItems(navigation, "student").map(({ url }) => url);
    expect(studentLinks).toContain("/meals");
    expect(studentLinks).toContain("/feedback");
    expect(studentLinks).not.toContain("/revenue");
    expect(studentLinks).not.toContain("/admin");
  });

  it("shows admin links but hides student-only links from admins", () => {
    const adminLinks = filterNavigationItems(navigation, "admin").map(({ url }) => url);
    expect(adminLinks).toContain("/admin");
    expect(adminLinks).toContain("/predictions");
    expect(adminLinks).toContain("/revenue");
    expect(adminLinks).not.toContain("/meals");
    expect(adminLinks).not.toContain("/feedback");
  });

  it("does not treat an unverified role as either role", () => {
    const links = filterNavigationItems(navigation, null).map(({ url }) => url);
    expect(links).not.toContain("/meals");
    expect(links).not.toContain("/feedback");
    expect(links).not.toContain("/admin");
    expect(links).not.toContain("/revenue");
  });

  it("validates feedback ownership by authenticated UID", () => {
    expect(isFeedbackOwner("student-1", "student-1")).toBe(true);
    expect(isFeedbackOwner("student-1", "student-2")).toBe(false);
    expect(isFeedbackOwner(null, "student-1")).toBe(false);
  });
});
