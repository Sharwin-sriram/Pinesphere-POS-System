"""
Database-backed staff management views
Replaces mock data with real database queries
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from django.db.models import Q
from .models import StaffMember, Role, Shift


def serialize_staff_member(staff):
    """Convert StaffMember model to API response format"""
    return {
        "id": str(staff.id),
        "first_name": staff.first_name,
        "last_name": staff.last_name,
        "email": staff.email,
        "phone": staff.phone,
        "dob": staff.dob.isoformat() if staff.dob else None,
        "profile_photo": staff.profile_photo,
        "role": staff.role,
        "employment_type": staff.employment_type,
        "date_joined": staff.date_joined.isoformat(),
        "salary_rate": float(staff.salary_rate),
        "status": staff.status,
        "assigned_shift": staff.assigned_shift,
        "pin": staff.pin,
        "admin_access": staff.admin_access,
        "tables": [],
        "recent_activity": [],
        "performance": {
            "orders_today": 0,
            "orders_week": 0,
            "orders_month": 0,
            "avg_value": 0.0
        },
        "today_schedule": {
            "clock_in": "09:00 AM" if staff.status == "Active" else "",
            "clock_out": "Still on shift" if staff.status == "Active" else "",
            "total_hours": "0.0"
        }
    }


def compute_staff_summary(restaurant_id):
    """Calculate staff statistics for a restaurant"""
    staff_list = StaffMember.objects.filter(restaurant_id=restaurant_id)
    roles_list = Role.objects.filter(restaurant_id=restaurant_id)
    
    on_leave = staff_list.filter(status="On Leave").count()
    inactive = staff_list.filter(status="Inactive").count()
    on_shift = staff_list.filter(status="Active").count()  # Simplified: all active are on shift
    off_shift = 0  # Simplified for now
    
    return {
        "total_staff": staff_list.count(),
        "on_shift": on_shift,
        "off_shift": off_shift,
        "on_leave": on_leave,
        "total_roles": roles_list.count()
    }


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_staff_list(request, pk):
    """List and create staff members for a restaurant"""
    if request.method == "GET":
        search = (request.query_params.get("search") or "").strip().lower()
        role_filter = (request.query_params.get("role") or "").strip()
        status_filter = (request.query_params.get("status") or "").strip()
        shift_filter = (request.query_params.get("shift") or "").strip()
        sort = (request.query_params.get("sort") or "name_asc").strip()
        
        try:
            page = max(int(request.query_params.get("page", 1)), 1)
        except ValueError:
            page = 1
        try:
            page_size = min(max(int(request.query_params.get("page_size", 10)), 1), 100)
        except ValueError:
            page_size = 10
        
        # Build query
        queryset = StaffMember.objects.filter(restaurant_id=pk)
        
        # Search
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(role__icontains=search)
            )
        
        # Filters
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Sorting
        if sort == "name_asc":
            queryset = queryset.order_by("first_name", "last_name")
        elif sort == "name_desc":
            queryset = queryset.order_by("-first_name", "-last_name")
        elif sort == "role":
            queryset = queryset.order_by("role")
        elif sort == "date_joined_desc":
            queryset = queryset.order_by("-date_joined")
        elif sort == "date_joined_asc":
            queryset = queryset.order_by("date_joined")
        
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        
        results = [serialize_staff_member(s) for s in queryset[start:end]]
        summary = compute_staff_summary(pk)
        
        return Response({
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
            "summary": summary
        })
    
    elif request.method == "POST":
        data = request.data
        
        # Validation
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        
        if not first_name or not last_name or not email or not phone:
            return Response(
                {"detail": "First name, last name, email, and phone number are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check email uniqueness
        if StaffMember.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check PIN uniqueness if provided
        pin = data.get("pin")
        if pin and StaffMember.objects.filter(pin=pin).exists():
            return Response(
                {"detail": "PIN already assigned to another member"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            staff = StaffMember.objects.create(
                restaurant_id=pk,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                dob=data.get("dob"),
                profile_photo=data.get("profile_photo", ""),
                role=data.get("role", "Waiter"),
                employment_type=data.get("employment_type", "Full-time"),
                date_joined=data.get("date_joined", date.today()),
                salary_rate=float(data.get("salary_rate", 0)),
                status=data.get("status", "Active"),
                assigned_shift=data.get("assigned_shift", ""),
                pin=pin,
                admin_access=bool(data.get("admin_access", False))
            )
            return Response(serialize_staff_member(staff), status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_staff_detail(request, pk, staff_id):
    """Get, update, or delete a staff member"""
    try:
        staff = StaffMember.objects.get(id=staff_id, restaurant_id=pk)
    except StaffMember.DoesNotExist:
        return Response(
            {"detail": "Staff member not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "GET":
        return Response(serialize_staff_member(staff))
    
    elif request.method == "PUT":
        data = request.data
        
        # Update fields
        staff.first_name = data.get("first_name", staff.first_name).strip()
        staff.last_name = data.get("last_name", staff.last_name).strip()
        staff.phone = data.get("phone", staff.phone).strip()
        staff.dob = data.get("dob", staff.dob)
        staff.profile_photo = data.get("profile_photo", staff.profile_photo)
        staff.role = data.get("role", staff.role)
        staff.employment_type = data.get("employment_type", staff.employment_type)
        staff.date_joined = data.get("date_joined", staff.date_joined)
        staff.assigned_shift = data.get("assigned_shift", staff.assigned_shift)
        staff.admin_access = bool(data.get("admin_access", staff.admin_access))
        staff.status = data.get("status", staff.status)
        
        if "salary_rate" in data:
            try:
                staff.salary_rate = float(data["salary_rate"])
            except (ValueError, TypeError):
                pass
        
        if "pin" in data:
            pin = data.get("pin")
            if pin and StaffMember.objects.filter(pin=pin).exclude(id=staff.id).exists():
                return Response(
                    {"detail": "PIN already assigned to another member"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            staff.pin = pin
        
        staff.save()
        return Response(serialize_staff_member(staff))
    
    elif request.method == "PATCH":
        data = request.data
        
        # Partial update
        if "status" in data:
            staff.status = data["status"]
        if "assigned_shift" in data:
            staff.assigned_shift = data["assigned_shift"]
        if "role" in data:
            staff.role = data["role"]
        if "admin_access" in data:
            staff.admin_access = bool(data["admin_access"])
        
        staff.save()
        return Response(serialize_staff_member(staff))
    
    elif request.method == "DELETE":
        staff.delete()
        return Response({"success": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff_email(request, pk):
    """Check if email is available for a restaurant"""
    email = (request.query_params.get("email") or "").strip().lower()
    exclude_id = (request.query_params.get("exclude_id") or "").strip()
    
    if not email:
        return Response({"is_available": True})
    
    queryset = StaffMember.objects.filter(restaurant_id=pk, email__iexact=email)
    if exclude_id:
        queryset = queryset.exclude(id=exclude_id)
    
    is_available = not queryset.exists()
    return Response({"is_available": is_available})


@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff_pin(request, pk):
    """Check if PIN is available for a restaurant"""
    pin = (request.query_params.get("pin") or "").strip()
    exclude_id = (request.query_params.get("exclude_id") or "").strip()
    
    if not pin:
        return Response({"is_available": True})
    
    queryset = StaffMember.objects.filter(restaurant_id=pk, pin=pin)
    if exclude_id:
        queryset = queryset.exclude(id=exclude_id)
    
    is_available = not queryset.exists()
    return Response({"is_available": is_available})


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_roles_list(request, pk):
    """List and create roles for a restaurant"""
    if request.method == "GET":
        roles = Role.objects.filter(restaurant_id=pk)
        return Response([{
            "id": str(r.id),
            "name": r.name,
            "color": r.color,
            "staff_count": StaffMember.objects.filter(restaurant_id=pk, role=r.name).count()
        } for r in roles])
    
    elif request.method == "POST":
        name = request.data.get("name", "").strip()
        color = request.data.get("color", "blue").strip()
        
        if not name:
            return Response(
                {"detail": "Role name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Role.objects.filter(restaurant_id=pk, name__iexact=name).exists():
            return Response(
                {"detail": "Role already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role = Role.objects.create(
            restaurant_id=pk,
            name=name,
            color=color
        )
        
        return Response({
            "id": str(role.id),
            "name": role.name,
            "color": role.color
        }, status=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([AllowAny])
def restaurant_role_detail(request, pk, role_id):
    """Update or delete a role"""
    try:
        role = Role.objects.get(id=role_id, restaurant_id=pk)
    except Role.DoesNotExist:
        return Response(
            {"detail": "Role not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "PUT":
        name = request.data.get("name", "").strip()
        color = request.data.get("color", "").strip()
        
        if not name:
            return Response(
                {"detail": "Role name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if name.lower() != role.name.lower() and Role.objects.filter(restaurant_id=pk, name__iexact=name).exists():
            return Response(
                {"detail": "Role name already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_name = role.name
        role.name = name
        if color:
            role.color = color
        role.save()
        
        # Update staff members with this role
        StaffMember.objects.filter(restaurant_id=pk, role=old_name).update(role=name)
        
        return Response({
            "id": str(role.id),
            "name": role.name,
            "color": role.color
        })
    
    elif request.method == "DELETE":
        # Check if role is assigned to any staff
        if StaffMember.objects.filter(restaurant_id=pk, role=role.name).exists():
            return Response(
                {"detail": "Cannot delete role assigned to staff members"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role.delete()
        return Response({"success": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_shifts_list(request, pk):
    """List shifts for a restaurant"""
    shifts = Shift.objects.filter(restaurant_id=pk)
    return Response([{
        "id": str(s.id),
        "name": s.name,
        "start_time": s.start_time.isoformat(),
        "end_time": s.end_time.isoformat()
    } for s in shifts])
