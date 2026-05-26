from .models import SalesReport

def monthly_sales_report():
    reports = SalesReport.objects.all()

    total_sales = sum(report.total_sales for report in reports)
    total_orders = sum(report.total_orders for report in reports)

    return {
        "total_sales": total_sales,
        "total_orders": total_orders
    }