import { describe, expect, it } from "vitest";
import { getRoleHomePath } from "./authRoutes";

describe("getRoleHomePath", () => {
  it("routes restaurant admin roles to the restaurant admin dashboard", () => {
    expect(getRoleHomePath("restaurant")).toBe("/");
    expect(getRoleHomePath("restaurant_admin")).toBe("/restaurant-admin");
    expect(getRoleHomePath("restaurant-admin")).toBe("/restaurant-admin");
  });
});