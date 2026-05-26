from django.db import models


class SalesReport(models.Model):
    date = models.DateField()
    total_sales = models.DecimalField(max_digits=10, decimal_places=2)
    total_orders = models.IntegerField()

    def __str__(self):
        return str(self.date)


class Product(models.Model):
    name = models.CharField(max_length=100)
    quantity_sold = models.IntegerField()

    def __str__(self):
        return self.name


class Order(models.Model):
    order_time = models.DateTimeField()

    def __str__(self):
        return str(self.order_time)
    
class Branch(models.Model):
    name = models.CharField(max_length=100)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
class Employee(models.Model):
    name = models.CharField(max_length=100)
    orders_handled = models.IntegerField()
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
    
from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    total_orders = models.IntegerField()
    total_spent = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Inventory(models.Model):
    product_name = models.CharField(max_length=100)
    stock_quantity = models.IntegerField()

    def __str__(self):
        return self.product_name
    
class ProfitRecord(models.Model):
    revenue = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Revenue: {self.revenue}"
class OrderReport(models.Model):
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Cancelled', 'Cancelled'),
    ]

    order_id = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return self.order_id

class TaxRecord(models.Model):
    total_sales = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Sales: {self.total_sales}"
class InventoryReport(models.Model):
    product_name = models.CharField(max_length=100)
    stock_quantity = models.IntegerField()

    def __str__(self):
        return self.product_name
class EmployeeReport(models.Model):
    employee_name = models.CharField(max_length=100)
    orders_handled = models.IntegerField()
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.employee_name
class CustomerReport(models.Model):
    customer_name = models.CharField(max_length=100)
    total_orders = models.IntegerField()
    total_spent = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.customer_name
class CancellationReport(models.Model):
    order_id = models.CharField(max_length=50)
    reason = models.CharField(max_length=200)

    def __str__(self):
        return self.order_id
class DiscountReport(models.Model):
    order_id = models.CharField(max_length=50)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.order_id
