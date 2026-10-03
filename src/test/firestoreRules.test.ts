import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");
const usersRules = rules.split("match /users/{uid}")[1].split("match /meals/{mealId}")[0];

describe("Firestore payment and role security rules", () => {
  it("allows payment status updates only in the admin branch with valid values", () => {
    expect(usersRules).toMatch(/allow update: if \(isAdmin\(\)/);
    expect(usersRules).toMatch(/request\.resource\.data\.paymentStatus in \['paid', 'unpaid'\]/);
  });

  it("keeps paymentStatus out of the student-owned profile update allowlist", () => {
    const updateRule = usersRules.split("allow update: if")[1].split("allow delete:")[0];
    const ownerUpdate = updateRule.split("|| (")[1];
    const allowedFields = ownerUpdate.match(/affectedKeys\(\)\.hasOnly\(\[([\s\S]*?)\]\)/)?.[1];
    expect(allowedFields).toBeDefined();
    expect(allowedFields).not.toContain("paymentStatus");
    expect(allowedFields).not.toContain("role");
  });

  it("retains the final deny rule", () => {
    expect(rules).toMatch(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
  });
});
