// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import RestaurantSignupForm from "../components/RestaurantSignupForm";

const checkEmailUniqueMock = vi.hoisted(() => vi.fn());
const registerRestaurantMock = vi.hoisted(() => vi.fn());

vi.mock("../../lib/authService", () => ({
  authService: {
    checkEmailUnique: checkEmailUniqueMock,
    registerRestaurant: registerRestaurantMock,
    getUserRole: vi.fn(),
    restaurantLogin: vi.fn(),
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

describe("RestaurantSignupForm", () => {
  beforeEach(() => {
    checkEmailUniqueMock.mockReset();
    registerRestaurantMock.mockReset();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("blocks Step 2 transition when Step 1 is invalid and focuses first error", async () => {
    render(<RestaurantSignupForm />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Full name is required")).toBeTruthy();
    expect(screen.getByText("Email is required")).toBeTruthy();

    const fullNameInput = screen.getByLabelText("Full name") as HTMLInputElement;
    await waitFor(() => {
      expect(document.activeElement).toBe(fullNameInput);
    });

    expect(screen.queryByLabelText("Restaurant name")).toBeNull();
  });

  it("debounces email uniqueness check and blocks Next when email is already registered", async () => {
    checkEmailUniqueMock.mockResolvedValue({ success: true, isAvailable: false });

    render(<RestaurantSignupForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Priya Sharma" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "owner@restaurant.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Password1!" } });

    const emailInput = screen.getByLabelText("Email address") as HTMLInputElement;
    fireEvent.blur(emailInput);

    expect(checkEmailUniqueMock).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(checkEmailUniqueMock).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    await waitFor(() => {
      expect(checkEmailUniqueMock).toHaveBeenCalledWith("owner@restaurant.com");
    });

    expect(await screen.findByText("Email already registered")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByLabelText("Restaurant name")).toBeNull();
  });

  it("moves to Step 2 when Step 1 validates cleanly", async () => {
    checkEmailUniqueMock.mockResolvedValue({ success: true, isAvailable: true });

    render(<RestaurantSignupForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Priya Sharma" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "fresh@restaurant.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Password1!" } });

    // trigger uniqueness check
    fireEvent.blur(screen.getByLabelText("Email address"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    await waitFor(() => {
      expect(checkEmailUniqueMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByLabelText("Restaurant name")).toBeTruthy();
  });

  it("validates Step 2 fields on Create Account submit", async () => {
    checkEmailUniqueMock.mockResolvedValue({ success: true, isAvailable: true });

    render(<RestaurantSignupForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Priya Sharma" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "fresh2@restaurant.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Password1!" } });
    fireEvent.blur(screen.getByLabelText("Email address"));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 400));
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByLabelText("Restaurant name")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Restaurant name is required")).toBeTruthy();
    expect(screen.getByText("Please select at least one cuisine")).toBeTruthy();
  });
});

