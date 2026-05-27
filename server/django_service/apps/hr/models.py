from django.conf import settings
from django.db import models
from django.utils import timezone

class Employee(models.Model):
    ROLE_CHOICES = (
        ('Manager', 'Manager'),
        ('Waiter', 'Waiter'),
        ('Kitchen', 'Kitchen Staff'),
        ('Cashier', 'Cashier'),
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile',
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=50, blank=True, null=True, default='Service')
    branch = models.CharField(max_length=50, blank=True, null=True, default='Main')
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=50, blank=True, null=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    hire_date = models.DateField(auto_now_add=True)
    photo_url = models.URLField(blank=True, null=True)
    face_encoding = models.TextField(blank=True, null=True, help_text="Store face vector data here for camera recognition")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Shift(models.Model):
    name = models.CharField(max_length=50) # Morning, Afternoon, Night
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"


class EmployeeShift(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    date = models.DateField()

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee} - {self.shift.name} on {self.date}"

class ShiftSwapRequest(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='swap_requests')
    current_shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='swap_from')
    requested_shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='swap_to')
    date = models.DateField()
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee} Swap {self.current_shift} -> {self.requested_shift} on {self.date}"


class Attendance(models.Model):
    ATTENDANCE_STATUS = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
        ('Leave', 'On Leave'),
    )
    METHOD_CHOICES = (
        ('PIN', 'PIN'),
        ('RFID', 'RFID'),
        ('Biometric', 'Biometric'),
        ('Face Scan', 'Face Scan'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS, default='Absent')
    late_minutes = models.IntegerField(default=0)
    overtime_minutes = models.IntegerField(default=0)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='Face Scan')

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee} - {self.date} ({self.status})"


class AttendanceCorrection(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_corrections')
    date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Correction for {self.employee} on {self.date}"


class LeaveRequest(models.Model):
    LEAVE_TYPES = (
        ('Casual', 'Casual Leave'),
        ('Sick', 'Sick Leave'),
        ('Emergency', 'Emergency Leave'),
        ('Paid', 'Paid Leave'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    manager_comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"


class LeaveBalance(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='leave_balance')
    casual_leaves = models.IntegerField(default=10)
    sick_leaves = models.IntegerField(default=5)
    paid_leaves = models.IntegerField(default=15)
    
    def __str__(self):
        return f"Balances for {self.employee}"


class Payroll(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    month = models.IntegerField() # 1-12
    year = models.IntegerField()
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    incentives = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_payable = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"Payroll {self.employee} - {self.month}/{self.year}"


class PerformanceRecord(models.Model):
    RATING_CHOICES = (
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Needs Improvement', 'Needs Improvement'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_records')
    month = models.IntegerField()
    year = models.IntegerField()
    rating = models.CharField(max_length=20, choices=RATING_CHOICES, default='Good')
    # Store dynamic metrics based on role (e.g. {"orders_served": 500, "customer_rating": 4.5} for Waiter)
    metrics = models.JSONField(default=dict)

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"Perf {self.employee} - {self.month}/{self.year} ({self.rating})"


class Incentive(models.Model):
    INCENTIVE_TYPES = (
        ('Sales', 'Sales Bonus'),
        ('Attendance', 'Attendance Bonus'),
        ('Performance', 'Performance Bonus'),
        ('Festival', 'Festival Bonus'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='incentives')
    type = models.CharField(max_length=20, choices=INCENTIVE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_awarded = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.type} for {self.employee} - ${self.amount}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('Shift', 'Shift Alert'),
        ('Leave', 'Leave Update'),
        ('Salary', 'Salary Processed'),
        ('Warning', 'Warning/Alert'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.message[:20]}"

