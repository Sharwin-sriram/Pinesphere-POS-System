from rest_framework import serializers
from .models import (Employee, Shift, EmployeeShift, ShiftSwapRequest, Attendance, AttendanceCorrection, LeaveRequest, LeaveBalance, Payroll, PerformanceRecord, Incentive, Notification)

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class EmployeeShiftSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)
    shift_details = ShiftSerializer(source='shift', read_only=True)

    class Meta:
        model = EmployeeShift
        fields = '__all__'

class ShiftSwapRequestSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)
    current_shift_details = ShiftSerializer(source='current_shift', read_only=True)
    requested_shift_details = ShiftSerializer(source='requested_shift', read_only=True)

    class Meta:
        model = ShiftSwapRequest
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'

class AttendanceCorrectionSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = AttendanceCorrection
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'

class LeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'

class PerformanceRecordSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = PerformanceRecord
        fields = '__all__'

class IncentiveSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Incentive
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'

