import { describe, expect, it } from "vitest";
import { getRoleHomePath } from "./authRoutes";

describe("getRoleHomePath", () => {
  it("keeps restaurant roles on the default dashboard unless a page overrides them", () => {
    expect(getRoleHomePath("restaurant")).toBe("/dashboard");
    expect(getRoleHomePath("restaurant_admin")).toBe("/dashboard");
    expect(getRoleHomePath("restaurant-admin")).toBe("/dashboard");
  });
});