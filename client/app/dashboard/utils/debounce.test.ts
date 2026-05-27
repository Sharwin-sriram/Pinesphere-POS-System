import { describe, it, expect, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  it("should delay function execution by specified time", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 300);

    debouncedFn("test");
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledWith("test");
    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("should override previous calls if invoked within the delay window", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 300);

    debouncedFn("first");
    vi.advanceTimersByTime(200);

    debouncedFn("second"); // resets timer
    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledWith("second");
    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("should cancel pending executions when cancel() is called", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 300);

    debouncedFn("cancel-test");
    vi.advanceTimersByTime(200);

    debouncedFn.cancel();
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
