# Pre-Implementation Audit — Staff Management Page

## Codebase Audit Findings

### 1. State Management Solution
- **Finding:** The application manages server state locally within page/feature modules via custom hooks (e.g., `useTables`, `useMenu`) that wrap component-level React state (`useState`, `useMemo`, `useEffect`).
- **Standard:** All server state for the Staff Management page must flow through a custom hook (e.g., `useStaff`) that orchestrates fetching from the HTTP service layer, handles debouncing, performs pagination, and implements optimistic state updates/rollbacks.

### 2. HTTP Service Layer
- **Finding:** Every API call routes through the shared Axios instance `httpClient` imported from `@/app/lib/authService` (or `../../../lib/authService`). No raw `fetch` or `axios` instances are used inside components.
- **Standard:** All staff-related API calls will route through a dedicated `staffApi` service layer, importing `httpClient` from `@/app/lib/authService`.

### 3. Form Library
- **Finding:** The application does not use external form libraries like Formik or React Hook Form. Forms are controlled standard components validated programmatically on `onChange`, `onBlur`, and `onSubmit` using React state.
- **Standard:** All staff creation and editing forms must use React state with explicit validation rules (minimum age, email uniqueness, phone format, and 4-digit PIN uniqueness check).

### 4. Modal and Drawer Components
- **Finding:** Modals consume the shared `Modal` component from `@/components/ui/Modal`. Drawers are implemented as custom side sheets (using `aside` with absolute/fixed layout, responsive breakpoints, and custom overlay click handling).
- **Standard:** 
  - Add/Edit Staff flows will use the shared `Modal` component.
  - Staff Details view will use a slide-out drawer matching the design layout of `TableDrawer.tsx`, featuring a responsive bottom sheet design on mobile.

### 5. Confirmation Dialog Component
- **Finding:** Deletion and destructive flows reuse the shared `Modal` component by configuring it with custom headers, descriptive warnings, and primary/secondary button triggers.
- **Standard:** All staff deactivation, de-allocation, and deletion flows must open a warning dialog using the shared `Modal` component.

### 6. Toast/Notification System
- **Finding:** All status and mutation feedback is dispatched via the `react-hot-toast` library using `toast.success`, `toast.error`, and `toast.loading`.
- **Standard:** Use `react-hot-toast` for all actions: "Staff member added", "Staff member updated", "Staff member removed", status transitions, and error rollbacks.

### 7. Table/Data Grid Pattern
- **Finding:** Desktop tables (e.g., `MenuTable.tsx`) feature an outer `overflow-x-auto` wrapper with borders, a sticky/capitalized header, clean row transitions, name truncation with tooltip fallbacks, status/role badges, and an right-aligned action group.
- **Standard:** Staff List table view must replicate this anatomy exactly, ensuring mobile grid fallback, touch target heights (minimum 44x44px), and accessibility labels.

### 8. Badge/Chip Component
- **Finding:** The shared `Badge` component in `@/components/ui/Badge.tsx` supports multiple variants: `default`, `accent`, `blue`, `success`, `warning`, `danger`.
- **Standard:** Replicate these variants for roles and staff status:
  - Role: `blue` or `accent`
  - Status: Active (`success`), Inactive (`default` or `danger`), On Leave (`warning`)

### 9. Sidebar Component
- **Finding:** The admin sidebar is located in `@/app/components/restaurant-admin/AdminSidebar.tsx` and already includes a "Staff" link pointing to `/restaurant-admin/staff`.
- **Standard:** No edits to the sidebar structure are required since the link is already integrated and utilizes the correct active detection logic.

### 10. Icon Set
- **Finding:** The application exclusively imports Lucide React icons (`lucide-react`).
- **Standard:** All icons used in the Staff Management page must be imported from `lucide-react`.

### 11. Design Tokens (/restaurant-admin)
- **Finding:** Design tokens are defined in `globals.css` using custom variables (e.g., `--color-bg-primary`, `--color-accent-green`, `--color-border`).
- **Standard:** Use existing Tailwind theme variables mapping to variables (e.g. `bg-[var(--color-bg-primary)]`, `text-[var(--color-text-primary)]`, `border-[var(--color-border)]`) without adding new hardcoded values.
