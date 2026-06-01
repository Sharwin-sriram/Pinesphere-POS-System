from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, ShiftViewSet, EmployeeShiftViewSet, ShiftSwapRequestViewSet,
    AttendanceViewSet, AttendanceCorrectionViewSet, LeaveRequestViewSet, LeaveBalanceViewSet,
    PayrollViewSet, PerformanceRecordViewSet, IncentiveViewSet, NotificationViewSet,
    hr_dashboard, mark_attendance,
    employee_dashboard, employee_attendance_history
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'shifts', ShiftViewSet)
router.register(r'employee-shifts', EmployeeShiftViewSet)
router.register(r'shift-swaps', ShiftSwapRequestViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'attendance-corrections', AttendanceCorrectionViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'leave-balances', LeaveBalanceViewSet)
router.register(r'payroll', PayrollViewSet)
router.register(r'performance', PerformanceRecordViewSet)
router.register(r'incentives', IncentiveViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', hr_dashboard, name='hr_dashboard'),
    path('attendance/mark/', mark_attendance, name='mark_attendance'),
    path('employees/<int:pk>/my-dashboard/', employee_dashboard, name='employee_dashboard'),
    path('employees/<int:pk>/attendance-history/', employee_attendance_history, name='employee_attendance_history'),
]
