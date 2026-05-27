import { describe, expect, it } from "vitest";
import { getRoleHomePath } from "./authRoutes";

describe("getRoleHomePath", () => {
  it("keeps restaurant roles on the default home unless a page overrides them", () => {
    expect(getRoleHomePath("restaurant")).toBe("/");
    expect(getRoleHomePath("restaurant_admin")).toBe("/");
    expect(getRoleHomePath("restaurant-admin")).toBe("/");
  });
});