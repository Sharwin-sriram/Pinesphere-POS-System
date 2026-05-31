"""
Address management API views
Handles user delivery address operations
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Address


def serialize_address(address):
    """Convert Address model to API response format"""
    return {
        "id": str(address.id),
        "address_type": address.address_type,
        "street_address": address.street_address,
        "apartment_suite": address.apartment_suite,
        "city": address.city,
        "state": address.state,
        "postal_code": address.postal_code,
        "country": address.country,
        "phone": address.phone,
        "is_default": address.is_default,
        "full_address": address.get_full_address(),
        "created_at": address.created_at.isoformat(),
        "updated_at": address.updated_at.isoformat(),
    }


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def address_list(request):
    """Get all addresses for the user or create a new address"""
    if request.method == "GET":
        addresses = Address.objects.filter(user=request.user).order_by('-is_default', '-created_at')
        return Response({
            "count": addresses.count(),
            "results": [serialize_address(addr) for addr in addresses]
        })
    
    # POST - Create new address
    data = request.data
    
    # Validate required fields
    required_fields = ['street_address', 'city', 'state', 'postal_code']
    for field in required_fields:
        if not data.get(field):
            return Response(
                {"detail": f"{field} is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # If this is the first address, make it default
    is_default = data.get('is_default', False)
    if not Address.objects.filter(user=request.user).exists():
        is_default = True
    
    # If setting as default, unset other defaults
    if is_default:
        Address.objects.filter(user=request.user).update(is_default=False)
    
    address = Address.objects.create(
        user=request.user,
        address_type=data.get('address_type', 'home'),
        street_address=data.get('street_address'),
        apartment_suite=data.get('apartment_suite', ''),
        city=data.get('city'),
        state=data.get('state'),
        postal_code=data.get('postal_code'),
        country=data.get('country', 'India'),
        phone=data.get('phone', ''),
        is_default=is_default,
    )
    
    return Response(serialize_address(address), status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    """Get, update, or delete a specific address"""
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return Response(
            {"detail": "Address not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "GET":
        return Response(serialize_address(address))
    
    elif request.method == "PUT":
        data = request.data
        
        # Update fields
        address.address_type = data.get('address_type', address.address_type)
        address.street_address = data.get('street_address', address.street_address)
        address.apartment_suite = data.get('apartment_suite', address.apartment_suite)
        address.city = data.get('city', address.city)
        address.state = data.get('state', address.state)
        address.postal_code = data.get('postal_code', address.postal_code)
        address.country = data.get('country', address.country)
        address.phone = data.get('phone', address.phone)
        
        # Handle default flag
        if 'is_default' in data and data.get('is_default'):
            Address.objects.filter(user=request.user).update(is_default=False)
            address.is_default = True
        elif 'is_default' in data:
            address.is_default = False
        
        address.save()
        return Response(serialize_address(address))
    
    elif request.method == "DELETE":
        # Don't allow deleting the only address
        if Address.objects.filter(user=request.user).count() == 1:
            return Response(
                {"detail": "Cannot delete the only address"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        address.delete()
        return Response({"detail": "Address deleted successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_default_address(request):
    """Get the user's default address"""
    try:
        address = Address.objects.get(user=request.user, is_default=True)
        return Response(serialize_address(address))
    except Address.DoesNotExist:
        # Return first address if no default is set
        address = Address.objects.filter(user=request.user).first()
        if address:
            return Response(serialize_address(address))
        return Response(
            {"detail": "No addresses found"},
            status=status.HTTP_404_NOT_FOUND
        )
