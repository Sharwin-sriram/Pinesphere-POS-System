from django.contrib import admin
from .models import (
    SalesReport,
    Product,
    Order,
    Branch,
    Employee,
    Customer,
    Inventory,
    ProfitRecord,
    OrderReport,
    TaxRecord,
    InventoryReport,
    EmployeeReport,
    CustomerReport,
    CancellationReport,
    DiscountReport,
)

admin.site.register(SalesReport)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Branch)
admin.site.register(Employee)
admin.site.register(Customer)
admin.site.register(Inventory)
admin.site.register(ProfitRecord)
admin.site.register(OrderReport)
admin.site.register(TaxRecord)
admin.site.register(InventoryReport)
admin.site.register(EmployeeReport)
admin.site.register(CustomerReport)
admin.site.register(CancellationReport)
admin.site.register(DiscountReport)
