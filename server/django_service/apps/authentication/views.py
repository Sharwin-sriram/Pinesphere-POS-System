"""Views for authentication app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authentication.models import Branch, Restaurant
from .serializers import BranchSerializer, RestaurantSerializer


class BranchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing branches."""

    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get branches for the authenticated user's restaurant."""
        restaurant_id = self.kwargs.get("restaurant_id")
        return Branch.objects.filter(restaurant_id=restaurant_id)

    def get_restaurant(self):
        """Get the restaurant object."""
        restaurant_id = self.kwargs.get("restaurant_id")
        try:
            return Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return None

    def create(self, request, *args, **kwargs):
        """Create a new branch for the restaurant."""
        restaurant = self.get_restaurant()
        if not restaurant:
            return Response(
                {"error": "Restaurant not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Add restaurant to the validated data
        serializer.validated_data["restaurant"] = restaurant
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Save the branch."""
        serializer.save()

    def perform_update(self, serializer):
        """Update the branch."""
        serializer.save()

    @action(detail=False, methods=["get"])
    def active(self, request, *args, **kwargs):
        """Get all active branches for the restaurant."""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def inactive(self, request, *args, **kwargs):
        """Get all inactive branches for the restaurant."""
        queryset = self.get_queryset().filter(is_active=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RestaurantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing restaurants."""

    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"])
    def branches(self, request, pk=None):
        """Get all branches for a specific restaurant."""
        restaurant = self.get_object()
        branches = restaurant.branches.all()
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)
