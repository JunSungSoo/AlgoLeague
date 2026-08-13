import { describe, expect, it } from "vitest";
import { canManage } from "./permissions";

describe("role permissions", () => {
    it("allows only operational roles to manage", () => {
        expect(canManage("LEARNER")).toBe(false);
        expect(canManage("OPERATOR")).toBe(true);
        expect(canManage("ADMIN")).toBe(true);
        expect(canManage(null)).toBe(false);
    });
});
