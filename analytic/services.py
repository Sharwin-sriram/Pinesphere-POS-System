from .models import SalesReport, Product


def get_chart_data():
    reports = SalesReport.objects.all()

    labels = []
    sales = []

    for report in reports:
        labels.append(str(report.date))
        sales.append(float(report.total_sales))

    return {
        "labels": labels,
        "sales": sales
    }


def get_top_selling_items():
    products = Product.objects.order_by('-quantity_sold')[:10]

    data = []

    for product in products:
        data.append({
            "name": product.name,
            "quantity_sold": product.quantity_sold
        })

    return data
from collections import Counter
from .models import Order


def get_peak_hours():
    orders = Order.objects.all()

    hours = []

    for order in orders:
        hours.append(order.order_time.hour)

    counter = Counter(hours)

    return counter.most_common()

from .models import Branch


def get_branch_performance():
    branches = Branch.objects.all().order_by('-total_sales')

    data = []

    for branch in branches:
        data.append({
            "branch": branch.name,
            "sales": float(branch.total_sales)
        })

    return data
from .models import Employee


def get_staff_performance():
    employees = Employee.objects.all().order_by('-revenue_generated')

    data = []

    for emp in employees:
        data.append({
            "employee": emp.name,
            "orders_handled": emp.orders_handled,
            "revenue_generated": float(emp.revenue_generated)
        })

    return data

from .models import Customer

def get_customer_analytics():
    customers = Customer.objects.all()

    return {
        "total_customers": customers.count(),
        "total_orders": sum(c.total_orders for c in customers),
        "total_spent": sum(c.total_spent for c in customers)
    }
from .models import Inventory


def get_inventory_insights():
    products = Inventory.objects.all()

    total_products = products.count()
    low_stock = products.filter(stock_quantity__lt=10).count()
    out_of_stock = products.filter(stock_quantity=0).count()

    return {
        "total_products": total_products,
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock
    }
from .models import ProfitRecord

def get_profit_analytics():
    records = ProfitRecord.objects.all()

    total_revenue = sum(record.revenue for record in records)
    total_cost = sum(record.cost for record in records)

    profit = total_revenue - total_cost

    return {
        "total_revenue": float(total_revenue),
        "total_cost": float(total_cost),
        "total_profit": float(profit)
    }
from .models import OrderReport

def get_order_report():
    orders = OrderReport.objects.all()

    total_orders = orders.count()
    completed = orders.filter(status='Completed').count()
    pending = orders.filter(status='Pending').count()
    cancelled = orders.filter(status='Cancelled').count()

    return {
        "total_orders": total_orders,
        "completed_orders": completed,
        "pending_orders": pending,
        "cancelled_orders": cancelled
    }
from .models import TaxRecord

def get_tax_report():
    records = TaxRecord.objects.all()

    total_sales = sum(record.total_sales for record in records)

    total_tax = 0

    for record in records:
        total_tax += (
            float(record.total_sales)
            * float(record.tax_percentage)
            / 100
        )

    net_revenue = float(total_sales) - total_tax

    return {
        "total_sales": float(total_sales),
        "total_tax": round(total_tax, 2),
        "net_revenue": round(net_revenue, 2)
    }
from .models import InventoryReport

def get_inventory_report():
    products = InventoryReport.objects.all()

    total_products = products.count()

    total_stock = sum(
        product.stock_quantity
        for product in products
    )

    low_stock = products.filter(
        stock_quantity__lt=10
    ).count()

    out_of_stock = products.filter(
        stock_quantity=0
    ).count()

    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "low_stock_products": low_stock,
        "out_of_stock_products": out_of_stock
    }

from .models import EmployeeReport

def get_employee_report():
    employees = EmployeeReport.objects.all()

    total_employees = employees.count()

    total_orders = sum(
        employee.orders_handled
        for employee in employees
    )

    total_revenue = sum(
        employee.revenue_generated
        for employee in employees
    )

    top_employee = employees.order_by(
        '-revenue_generated'
    ).first()

    return {
        "total_employees": total_employees,
        "total_orders_handled": total_orders,
        "total_revenue_generated": float(total_revenue),
        "top_employee": (
            top_employee.employee_name
            if top_employee
            else None
        )
    }
from .models import CustomerReport

def get_customer_report():
    customers = CustomerReport.objects.all()

    total_customers = customers.count()

    total_orders = sum(
        customer.total_orders
        for customer in customers
    )

    total_spent = sum(
        customer.total_spent
        for customer in customers
    )

    top_customer = customers.order_by(
        '-total_spent'
    ).first()

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_spent": float(total_spent),
        "top_customer": (
            top_customer.customer_name
            if top_customer
            else None
        )
    }
from .models import CancellationReport, OrderReport

def get_cancellation_report():
    total_orders = OrderReport.objects.count()
    cancelled_orders = CancellationReport.objects.count()

    cancellation_rate = 0

    if total_orders > 0:
        cancellation_rate = (
            cancelled_orders / total_orders
        ) * 100

    return {
        "total_orders": total_orders,
        "cancelled_orders": cancelled_orders,
        "cancellation_rate": round(
            cancellation_rate,
            2
        )
    }
from .models import DiscountReport

def get_discount_report():
    discounts = DiscountReport.objects.all()

    total_discount = sum(
        discount.discount_amount
        for discount in discounts
    )

    total_discount_orders = discounts.count()

    average_discount = 0

    if total_discount_orders > 0:
        average_discount = (
            total_discount / total_discount_orders
        )

    return {
        "total_discount": float(total_discount),
        "discounted_orders": total_discount_orders,
        "average_discount": float(average_discount)
    }