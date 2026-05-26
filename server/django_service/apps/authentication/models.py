"""Authentication models for the POS system."""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Restaurant(models.Model):
    """Restaurant model representing a restaurant."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    timezone = models.CharField(max_length=50, default='UTC')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Branch(models.Model):
    """Branch model representing a branch of a restaurant."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    manager_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = [['restaurant', 'name']]
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser."""
    
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
        ('chef', 'Chef'),
        ('customer', 'Customer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='staff')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, related_name='users', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['username']
    
    def __str__(self):
        return self.username
