// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import RestaurantLoginForm from "../components/RestaurantLoginForm";

const restaurantLoginMock = vi.hoisted(() => vi.fn());
const getUserRoleMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("next=/restaurant/orders/123"),
}));

vi.mock("../../lib/authService", () => ({
  authService: {
    restaurantLogin: restaurantLoginMock,
    getUserRole: getUserRoleMock,
    // unused by login tests
    checkEmailUnique: vi.fn(),
    registerRestaurant: vi.fn(),
  },
}));

vi.mock("../../components/auth/AuthShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../components/Toast", () => ({
  __esModule: true,
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    ToastContainer: () => null,
  }),
}));

describe("RestaurantLoginForm", () => {
  beforeEach(() => {
    restaurantLoginMock.mockReset();
    getUserRoleMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("shows required field errors on submit and focuses the first error", async () => {
    render(<RestaurantLoginForm />);

    const loginButton = screen.getAllByRole("button", { name: "Login" })[0];
    fireEvent.click(loginButton);

    expect(await screen.findByText("Email is required")).toBeTruthy();
    expect(screen.getByText("Password is required")).toBeTruthy();

    const emailInput = screen.getByLabelText("Email address") as HTMLInputElement;
    await waitFor(() => {
      expect(document.activeElement).toBe(emailInput);
    });
  });

  it("validates email format and password length", async () => {
    render(<RestaurantLoginForm />);

    const emailInput = screen.getByLabelText("Email address") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, {
      target: { name: "email", value: "not-an-email" },
    });
    fireEvent.change(passwordInput, {
      target: { name: "password", value: "short" },
    });

    const loginButtons = screen.getAllByRole("button", { name: "Login" });
    const form = loginButtons[0].closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText("Please enter a valid email")).toBeTruthy();
    expect(screen.getByText("Password must be at least 8 characters")).toBeTruthy();
  });

  it("redirects to next param after successful login and disables submit while loading", async () => {
    vi.useFakeTimers();

    getUserRoleMock.mockReturnValue("restaurant-admin");
    let resolveLogin: (v: any) => void;
    const loginPromise = new Promise((res) => {
      resolveLogin = res;
    });
    restaurantLoginMock.mockReturnValue(loginPromise);

    render(<RestaurantLoginForm />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@restaurant.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });

    const loginButton = screen.getAllByRole("button", { name: "Login" })[0];
    const hrefSetter = vi.fn();
    const originalLocation = window.location;
    // Replace the location object so `window.location.href = ...` can be observed.
    (window as any).location = {
      ...originalLocation,
      get href() {
        return "";
      },
      set href(v: string) {
        hrefSetter(v);
      },
    };

    fireEvent.click(loginButton);
    expect(loginButton.disabled).toBe(true);

    act(() => {
      resolveLogin?.({ success: true, data: {} });
    });

    await act(async () => {
      await loginPromise;
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(hrefSetter).toHaveBeenCalledWith("/restaurant/orders/123");

    (window as any).location = originalLocation;
    vi.useRealTimers();
  });
});

