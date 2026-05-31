import datetime
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q

from .models import (Employee, Shift, EmployeeShift, ShiftSwapRequest, Attendance, AttendanceCorrection, LeaveRequest, LeaveBalance, Payroll, PerformanceRecord, Incentive, Notification)
from .serializers import (
    EmployeeSerializer, ShiftSerializer, EmployeeShiftSerializer, ShiftSwapRequestSerializer,
    AttendanceSerializer, AttendanceCorrectionSerializer, LeaveRequestSerializer, LeaveBalanceSerializer, 
    PayrollSerializer, PerformanceRecordSerializer, IncentiveSerializer, NotificationSerializer
)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=False, methods=['get'])
    def directory_data(self, request):
        today = date.today()
        employees = self.get_queryset()
        
        # Summary Metrics
        total_employees = employees.count()
        active_employees = employees.filter(is_active=True).count()
        inactive_employees = total_employees - active_employees
        
        # New this month
        first_day_of_month = today.replace(day=1)
        new_this_month = employees.filter(hire_date__gte=first_day_of_month).count()
        
        # Today's Attendance & Leaves
        present_today = Attendance.objects.filter(date=today, status__in=['Present', 'Late']).count()
        on_leave_today = LeaveRequest.objects.filter(start_date__lte=today, end_date__gte=today, status='Approved').count()
        
        # Build detailed employee list
        employee_data = []
        for emp in employees:
            # Shift for today
            shift = EmployeeShift.objects.filter(employee=emp, date=today).first()
            shift_name = shift.shift.name if shift else "Off"
            
            # Attendance for today
            attendance = Attendance.objects.filter(employee=emp, date=today).first()
            if attendance:
                att_status = attendance.status
            elif LeaveRequest.objects.filter(employee=emp, start_date__lte=today, end_date__gte=today, status='Approved').exists():
                att_status = 'Leave'
            else:
                att_status = 'Absent' if shift else 'Off'

            # Calculate email based on user or fallback
            email = emp.user.email if emp.user and emp.user.email else f"{emp.first_name.lower()}@pinesphere.com"
            
            # Performance score average
            perf = PerformanceRecord.objects.filter(employee=emp).aggregate(avg=Sum('rating'))
            
            employee_data.append({
                'id': emp.id,
                'display_id': f"EMP{emp.id:03d}",
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'role': emp.role,
                'department': emp.department,
                'branch': emp.branch,
                'phone': emp.phone,
                'email': email,
                'hire_date': emp.hire_date,
                'is_active': emp.is_active,
                'photo_url': emp.photo_url,
                'current_shift': shift_name,
                'attendance_status': att_status,
                'performance_score': perf['avg'] if perf['avg'] else "N/A"
            })
            
        return Response({
            'summary': {
                'total': total_employees,
                'present': present_today,
                'on_leave': on_leave_today,
                'new_this_month': new_this_month,
                'inactive': inactive_employees
            },
            'employees': employee_data
        })

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

class EmployeeShiftViewSet(viewsets.ModelViewSet):
    queryset = EmployeeShift.objects.all().order_by('date')
    serializer_class = EmployeeShiftSerializer

    @action(detail=False, methods=['get'])
    def planner_data(self, request):
        target_date_str = request.query_params.get('date', str(date.today()))
        target_date = datetime.datetime.strptime(target_date_str, '%Y-%m-%d').date()

        assignments = EmployeeShift.objects.filter(date=target_date)
        all_employees = Employee.objects.filter(is_active=True)
        swaps = ShiftSwapRequest.objects.filter(status='Pending', date=target_date)

        # Aggregate counts
        morning_count = assignments.filter(shift__name__icontains='Morning').count()
        evening_count = assignments.filter(shift__name__icontains='Afternoon').count()
        night_count = assignments.filter(shift__name__icontains='Night').count()
        
        assigned_employee_ids = assignments.values_list('employee_id', flat=True)
        unassigned = all_employees.exclude(id__in=assigned_employee_ids).count()

        # Dummy Coverage Warning Logic: Expect 5 kitchen staff overall on any day
        assigned_kitchen = assignments.filter(employee__department='Kitchen').count()
        coverage_warnings = []
        if assigned_kitchen < 5:
            coverage_warnings.append({'msg': f"Kitchen shortage: {assigned_kitchen}/5 assigned", 'type': 'warning'})

        return Response({
            'metrics': {
                'morning': morning_count,
                'evening': evening_count,
                'night': night_count,
                'unassigned': unassigned,
                'swap_requests': swaps.count()
            },
            'assignments': EmployeeShiftSerializer(assignments, many=True).data,
            'swap_requests': ShiftSwapRequestSerializer(swaps, many=True).data,
            'coverage_warnings': coverage_warnings,
        })

class ShiftSwapRequestViewSet(viewsets.ModelViewSet):
    queryset = ShiftSwapRequest.objects.all()
    serializer_class = ShiftSwapRequestSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-date')
    serializer_class = AttendanceSerializer

    @action(detail=False, methods=['get'])
    def dashboard_data(self, request):
        today = date.today()
        # You could also allow a '?date=YYYY-MM-DD' param here
        
        attendances = Attendance.objects.filter(date=today)
        
        # Metrics
        present_count = attendances.filter(status='Present').count()
        late_count = attendances.filter(status='Late').count()
        absent_count = attendances.filter(status='Absent').count()
        leave_count = attendances.filter(status='Leave').count()
        overtime_count = attendances.filter(overtime_minutes__gt=0).count()
        
        total_tracked = present_count + late_count + absent_count + leave_count
        attendance_percentage = round(((present_count + late_count) / total_tracked * 100)) if total_tracked > 0 else 0

        # Sub-lists
        late_arrivals = AttendanceSerializer(attendances.filter(status='Late'), many=True).data
        overtime_employees = AttendanceSerializer(attendances.filter(overtime_minutes__gt=0), many=True).data
        corrections = AttendanceCorrectionSerializer(AttendanceCorrection.objects.filter(status='Pending'), many=True).data

        return Response({
            'metrics': {
                'present': present_count,
                'absent': absent_count,
                'late': late_count,
                'on_leave': leave_count,
                'overtime': overtime_count,
                'attendance_percentage': attendance_percentage
            },
            'late_arrivals': late_arrivals,
            'overtime_employees': overtime_employees,
            'corrections': corrections,
            'daily_records': AttendanceSerializer(attendances, many=True).data
        })

class AttendanceCorrectionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceCorrection.objects.all()
    serializer_class = AttendanceCorrectionSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'Approved'
        leave.save()
        return Response({'status': 'Leave approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'Rejected'
        leave.save()
        return Response({'status': 'Leave rejected'})

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer

class PerformanceRecordViewSet(viewsets.ModelViewSet):
    queryset = PerformanceRecord.objects.all()
    serializer_class = PerformanceRecordSerializer

class IncentiveViewSet(viewsets.ModelViewSet):
    queryset = Incentive.objects.all()
    serializer_class = IncentiveSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


@api_view(['GET'])
def hr_dashboard(request):
    today = timezone.now().date()
    
    total_employees = Employee.objects.count()
    present_today = Attendance.objects.filter(date=today, status__in=['Present', 'Late']).count()
    absent_today = Attendance.objects.filter(date=today, status='Absent').count()
    on_leave_today = LeaveRequest.objects.filter(start_date__lte=today, end_date__gte=today, status='Approved').count()
    
    # Calculate pending salaries amount
    pending_salaries_amount = Payroll.objects.filter(status='Pending').aggregate(total=Sum('net_payable'))['total'] or 0.00
    
    # Simple top performer (e.g., first one with Excellent rating this month)
    # Ideally should be aggregated over metrics, but this is a stub.
    top_performer = PerformanceRecord.objects.filter(rating='Excellent').order_by('-year', '-month').first()
    top_performer_name = f"{top_performer.employee.first_name} {top_performer.employee.last_name}" if top_performer else "N/A"

    return Response({
        'total_employees': total_employees,
        'present_today': present_today,
        'absent_today': absent_today,
        'on_leave_today': on_leave_today,
        'salary_pending': pending_salaries_amount,
        'top_performer': top_performer_name
    })

@api_view(['POST'])
def mark_attendance(request):
    # Simulated endpoint for face recognition or manual check-in
    employee_id = request.data.get('employee_id')
    time_str = request.data.get('time') # "09:15"
    
    if not employee_id or not time_str:
        return Response({'error': 'Missing employee_id or time'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        employee = Employee.objects.get(id=employee_id)
        check_time = datetime.datetime.strptime(time_str, '%H:%M').time()
        today = timezone.now().date()
        
        # Get assigned shift for today
        assigned_shift = EmployeeShift.objects.filter(employee=employee, date=today).first()
        
        attendance, created = Attendance.objects.get_or_create(employee=employee, date=today)
        
        # Check in logic
        if not attendance.check_in_time:
            attendance.check_in_time = check_time
            
            # Late calculation
            if assigned_shift:
                shift_start = assigned_shift.shift.start_time
                # Compare times
                # If check_time > shift_start, calculate late minutes
                delta_minutes = (check_time.hour * 60 + check_time.minute) - (shift_start.hour * 60 + shift_start.minute)
                if delta_minutes > 0:
                    attendance.late_minutes = delta_minutes
                    attendance.status = 'Late'
                else:
                    attendance.status = 'Present'
            else:
                attendance.status = 'Present' # No shift assigned, assumed present
                
            attendance.save()
            return Response({'message': f'Checked in at {time_str}', 'status': attendance.status, 'late_minutes': attendance.late_minutes})
            
        # Check out logic
        elif not attendance.check_out_time:
            attendance.check_out_time = check_time
            attendance.save()
            return Response({'message': f'Checked out at {time_str}'})
            
        else:
            return Response({'error': 'Already checked in and out today'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def employee_dashboard(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
        today = timezone.now().date()
        
        # Next Shift
        next_shift = EmployeeShift.objects.filter(employee=employee, date__gte=today).order_by('date').first()
        shift_data = None
        if next_shift:
            shift_data = {
                'name': next_shift.shift.name,
                'date': next_shift.date,
                'start_time': next_shift.shift.start_time,
                'end_time': next_shift.shift.end_time
            }
            
        # Leaves remaining
        balance, _ = LeaveBalance.objects.get_or_create(employee=employee)
        
        # Performance Score (Latest)
        latest_perf = PerformanceRecord.objects.filter(employee=employee).order_by('-year', '-month').first()
        perf_score = latest_perf.rating if latest_perf else "N/A"
        
        return Response({
            'name': f"{employee.first_name} {employee.last_name}",
            'role': employee.role,
            'next_shift': shift_data,
            'casual_leaves': balance.casual_leaves,
            'sick_leaves': balance.sick_leaves,
            'performance_score': perf_score
        })
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def employee_attendance_history(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
        attendances = Attendance.objects.filter(employee=employee).order_by('-date')[:30] # last 30 days
        data = AttendanceSerializer(attendances, many=True).data
        return Response(data)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

