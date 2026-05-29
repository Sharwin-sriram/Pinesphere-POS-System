import { describe, expect, it } from "vitest";
import { getRoleHomePath } from "./authRoutes";

describe("getRoleHomePath", () => {
  it("keeps restaurant roles on the default home unless a page overrides them", () => {
    expect(getRoleHomePath("ORGANIZATION_OWNER")).toBe("/restaurant-admin");
    expect(getRoleHomePath("restaurant")).toBe("/restaurant-admin");
    expect(getRoleHomePath("restaurant-admin")).toBe("/restaurant-admin");
  });
});