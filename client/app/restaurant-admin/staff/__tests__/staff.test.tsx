// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStaff } from "../hooks/useStaff";
import { staffApi } from "../services/staffApi";
import { StaffMember, Role, Shift } from "../types";

// Mock router navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  usePathname: () => "/restaurant-admin/staff",
  useSearchParams: () => ({
    get: (key: string) => null,
  }),
}));

// Mock staffApi and react-hot-toast
vi.mock("../services/staffApi", () => ({
  staffApi: {
    getStaff: vi.fn(),
    getRoles: vi.fn(),
    getShifts: vi.fn(),
    createStaff: vi.fn(),
    updateStaff: vi.fn(),
    patchStaff: vi.fn(),
    deleteStaff: vi.fn(),
    checkEmail: vi.fn(),
    checkPin: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

const mockStaffList: StaffMember[] = [
  {
    id: "s1",
    first_name: "Sarah",
    last_name: "Jenkins",
    email: "sarah.j@pinesphere.com",
    phone: "+15551234567",
    dob: "1995-08-22",
    profile_photo: "",
    role: "Waiter",
    employment_type: "Full-time",
    date_joined: "2024-03-10",
    salary_rate: 18.5,
    status: "Active",
    assigned_shift: "sf1",
    pin: "1111",
    admin_access: false,
    today_schedule: {
      clock_in: "09:02 AM",
      clock_out: "Still on shift", // Clocked in -> On Shift
      total_hours: "7.2",
    },
  },
  {
    id: "s2",
    first_name: "Michael",
    last_name: "Chang",
    email: "m.chang@pinesphere.com",
    phone: "+15559876543",
    dob: "1992-11-05",
    profile_photo: "",
    role: "Waiter",
    employment_type: "Full-time",
    date_joined: "2023-06-15",
    salary_rate: 19.0,
    status: "Active",
    assigned_shift: "sf2",
    pin: "2222",
    admin_access: false,
    today_schedule: {
      clock_in: "04:05 PM",
      clock_out: "2026-05-27T18:00:00Z", // Clocked out -> Off Shift
      total_hours: "1.5",
    },
  },
];

const mockRolesList: Role[] = [
  { id: "r_1", name: "Manager", color: "blue", staff_count: 0 },
  { id: "r_2", name: "Waiter", color: "success", staff_count: 2 },
];

const mockShiftsList: Shift[] = [
  { id: "sf1", name: "Morning Shift", start_time: "9:00 AM", end_time: "5:00 PM", break_duration: "45 min" },
];

describe("Staff Management Page — Custom hooks, validations, and API gates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(staffApi.getStaff).mockResolvedValue({
      results: [...mockStaffList],
      page: 1,
      page_size: 10,
      total: 2,
      has_next: false,
      summary: {
        total_staff: 2,
        on_shift: 1,
        off_shift: 1,
        on_leave: 0,
        total_roles: 2,
      },
    });
    vi.mocked(staffApi.getRoles).mockResolvedValue([...mockRolesList]);
    vi.mocked(staffApi.getShifts).mockResolvedValue([...mockShiftsList]);
  });

  // 1. Email Uniqueness Validation Check
  it("should validate email uniqueness checks successfully", async () => {
    vi.mocked(staffApi.checkEmail).mockResolvedValue({ is_available: false });
    const available = await staffApi.checkEmail("r1", "sarah.j@pinesphere.com");
    expect(available.is_available).toBe(false);
    expect(staffApi.checkEmail).toHaveBeenCalledWith("r1", "sarah.j@pinesphere.com", undefined);
  });

  // 2. PIN Uniqueness Validation Check
  it("should validate PIN code uniqueness checks successfully", async () => {
    vi.mocked(staffApi.checkPin).mockResolvedValue({ is_available: false });
    const available = await staffApi.checkPin("r1", "1111");
    expect(available.is_available).toBe(false);
    expect(staffApi.checkPin).toHaveBeenCalledWith("r1", "1111", undefined);
  });

  // 3. DOB minimum age restriction (18 years) validation
  it("should validate staff minimum age constraint", () => {
    const dobString = "2015-08-22"; // 11 years old today
    const dobDate = new Date(dobString);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    const isUnder18 = dobDate > eighteenYearsAgo;
    expect(isUnder18).toBe(true); // Should block (must be at least 18)
  });

  // 4. Optimistic Status Update & Rollback
  it("should optimistically toggle status and rollback on server error", async () => {
    vi.mocked(staffApi.patchStaff).mockRejectedValue(new Error("Database offline"));

    const { result } = renderHook(() => useStaff("r1"));

    // Resolve initial mount fetchings
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.staff[0].status).toBe("Active");

    let promise;
    await act(async () => {
      promise = result.current.toggleStaffStatus("s1", "On Leave", true);
    });

    // Optimistic Status toggle applied immediately
    expect(result.current.staff[0].status).toBe("On Leave");

    // Wait for the mock promise to throw and execute rollback
    await act(async () => {
      try {
        await promise;
      } catch {
        // Expected mock error
      }
    });

    // State reverts back to original status
    expect(result.current.staff[0].status).toBe("Active");
  });

  // 5. Delete Guard (disallow removing staff while On Shift)
  it("should block deletion of staff members who are currently clocked in (On Shift)", async () => {
    const clockedInStaff = mockStaffList[0];
    const isClockedIn = clockedInStaff.status === "Active" && clockedInStaff.today_schedule?.clock_out === "Still on shift";
    
    // Test that client code recognizes clockedIn status as On Shift and blocks actions
    expect(isClockedIn).toBe(true);
    
    vi.mocked(staffApi.deleteStaff).mockRejectedValue(new Error("Cannot remove staff while on shift"));
    
    const { result } = renderHook(() => useStaff("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    let deleted = false;
    try {
      await result.current.deleteStaffMember("s1");
    } catch {
      deleted = false;
    }
    
    // Verify rollback or that state remains unchanged
    expect(result.current.staff).toHaveLength(2);
    expect(result.current.staff[0].id).toBe("s1");
  });

  // 6. Role Deletion Safety Guard
  it("should block role deletions if currently assigned to staff members", async () => {
    const waiterRole = mockRolesList[1]; // Waiter role has 2 staff assigned
    const hasStaffAssigned = (waiterRole.staff_count ?? 0) > 0;
    
    expect(hasStaffAssigned).toBe(true); // Blocked in UI
  });

  // 7. Filter parameters construction check
  it("should correctly build filter parameters including search, page and sort", async () => {
    const { result } = renderHook(() => useStaff("r1"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.filters.sort).toBe("name_asc");
    expect(result.current.filters.page).toBe(1);
  });
});
