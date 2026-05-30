export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob?: string;
  profile_photo?: string;
  role: string;
  employment_type: string;
  date_joined: string;
  salary_rate: number;
  status: "Active" | "Inactive" | "On Leave";
  assigned_shift: string;
  pin?: string;
  admin_access: boolean;
  tables?: string[];
  recent_activity?: { action: string; time: string }[];
  performance?: {
    orders_today: number;
    orders_week: number;
    orders_month: number;
    avg_value: number;
  };
  today_schedule?: {
    clock_in: string;
    clock_out: string;
    total_hours: string;
  };
}

export interface Role {
  id: string;
  name: string;
  color: string;
  staff_count?: number;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: string;
}

export interface StaffFilters {
  search?: string;
  role?: string;
  status?: string;
  shift?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface StaffSummary {
  total_staff: number;
  on_shift: number;
  off_shift: number;
  on_leave: number;
  total_roles: number;
}

export interface PaginatedStaff {
  results: StaffMember[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
  summary: StaffSummary;
}
