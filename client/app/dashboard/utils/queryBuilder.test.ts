import { describe, it, expect } from "vitest";
import { buildQueryParams } from "./queryBuilder";

describe("buildQueryParams", () => {
  it("should construct query parameters correctly with complete query objects", () => {
    const query = {
      q: "pizza",
      cuisine: "Italian",
      min_rating: 4.5,
      sort: "rating_desc",
      page: 1,
      page_size: 12,
    };
    const params = buildQueryParams(query);
    expect(params).toEqual({
      q: "pizza",
      cuisine: "Italian",
      min_rating: "4.5",
      sort: "rating_desc",
      page: "1",
      page_size: "12",
    });
  });

  it("should ignore empty or default values", () => {
    const query = {
      q: "",
      cuisine: "All",
      min_rating: 0,
      sort: "delivery_asc",
    };
    const params = buildQueryParams(query);
    expect(params).toEqual({
      sort: "delivery_asc",
    });
  });

  it("should handle undefined and optional values", () => {
    const query = {
      q: undefined,
      cuisine: undefined,
      min_rating: undefined,
      sort: undefined,
      page: undefined,
      page_size: undefined,
    };
    const params = buildQueryParams(query);
    expect(params).toEqual({});
  });
});
