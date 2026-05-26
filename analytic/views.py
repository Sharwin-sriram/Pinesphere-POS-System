from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render

from .models import SalesReport, Product
from .serializers import SalesReportSerializer, ProductSerializer
from .reports import monthly_sales_report
from .services import( get_chart_data, 
                      get_top_selling_items,
                      get_peak_hours,
                      get_branch_performance,
                      get_staff_performance,
                      get_customer_analytics,
                      get_inventory_insights,
                      get_profit_analytics,
                      get_order_report,
                      get_tax_report,
                      get_inventory_report,
                      get_employee_report,
                      get_customer_report,
                      get_cancellation_report,
                      get_discount_report,
                      )



class SalesReportListCreateView(generics.ListCreateAPIView):
    queryset = SalesReport.objects.all()
    serializer_class = SalesReportSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class MonthlyReportView(APIView):
    def get(self, request):
        return Response(monthly_sales_report())


class ChartDataView(APIView):
    def get(self, request):
        return Response(get_chart_data())


class TopSellingItemsView(APIView):
    def get(self, request):
        return Response(get_top_selling_items())


def dashboard(request):
    reports = SalesReport.objects.all()

    total_revenue = sum(report.total_sales for report in reports)
    total_orders = sum(report.total_orders for report in reports)

    context = {
        'total_revenue': total_revenue,
        'total_orders': total_orders,
    }

    return render(request, 'analytic/dashboard.html', context)
class PeakHoursView(APIView):
    def get(self, request):
        return Response(get_peak_hours())
    
class BranchPerformanceView(APIView):
    def get(self, request):
        return Response(get_branch_performance())

class StaffPerformanceView(APIView):
    def get(self, request):
        return Response(get_staff_performance())
    from .services import get_customer_analytics

class CustomerAnalyticsView(APIView):
    def get(self, request):
        return Response(get_customer_analytics())
    
class InventoryInsightsView(APIView):
    def get(self, request):
        return Response(get_inventory_insights())
    
class ProfitAnalyticsView(APIView):
    def get(self, request):
        return Response(get_profit_analytics())
    
class OrderReportView(APIView):
    def get(self, request):
        return Response(get_order_report())
class TaxReportView(APIView):
    def get(self, request):
        return Response(get_tax_report())
class InventoryReportView(APIView):
    def get(self, request):
        return Response(get_inventory_report())
class EmployeeReportView(APIView):
    def get(self, request):
        return Response(get_employee_report())
class CustomerReportView(APIView):
    def get(self, request):
        return Response(get_customer_report())
class CancellationReportView(APIView):
    def get(self, request):
        return Response( get_cancellation_report() )
class DiscountReportView(APIView):
    def get(self, request):
        return Response( get_discount_report() )
from django.http import HttpResponse
from reportlab.pdfgen import canvas

def export_pdf(request):
    response = HttpResponse(
        content_type='application/pdf'
    )

    response[
        'Content-Disposition'
    ] = 'attachment; filename="report.pdf"'

    p = canvas.Canvas(response)

    p.drawString(
        100,
        800,
        "Analytics Report"
    )

    p.drawString(
        100,
        780,
        "Generated Successfully"
    )

    p.showPage()
    p.save()

    return response
import openpyxl
from django.http import HttpResponse

def export_excel(request):

    workbook = openpyxl.Workbook()

    sheet = workbook.active

    sheet['A1'] = 'Analytics Report'
    sheet['A2'] = 'Generated Successfully'

    response = HttpResponse(
        content_type=
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    response[
        'Content-Disposition'
    ] = 'attachment; filename=report.xlsx'

    workbook.save(response)

    return response
import csv
from django.http import HttpResponse

def export_csv(request):

    response = HttpResponse(
        content_type='text/csv'
    )

    response[
        'Content-Disposition'
    ] = 'attachment; filename="report.csv"'

    writer = csv.writer(response)

    writer.writerow([
        'Report',
        'Status'
    ])

    writer.writerow([
        'Analytics',
        'Generated'
    ])

    return response
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def employee_list(request):
    data = [
        {
            "name": "Arun Kumar",
            "department": "Sales",
            "score": 95,
            "status": "Excellent"
        },
        {
            "name": "Priya",
            "department": "Customer Service",
            "score": 88,
            "status": "Good"
        },
        {
            "name": "Vijay",
            "department": "Inventory",
            "score": 72,
            "status": "Average"
        },
        {
            "name": "Karthik",
            "department": "Management",
            "score": 98,
            "status": "Excellent"
        }
    ]

    return Response(data)
@api_view(['GET'])
def inventory_list(request):
    data = [
        {
            "product":"Burger",
            "category":"Food",
            "stock":50,
            "status":"Available"
        },
        {
            "product":"Pizza",
            "category":"Food",
            "stock":40,
            "status":"Available"
        },
        {
            "product":"Coffee",
            "category":"Beverage",
            "stock":10,
            "status":"Low Stock"
        },
        {
            "product":"Juice",
            "category":"Beverage",
            "stock":0,
            "status":"Out Of Stock"
        }
    ]

    return Response(data)
@api_view(['GET'])
def customer_list(request):
    data = [
        {
            "name": "Mrittika",
            "orders": 15,
            "spent": 30000,
            "status": "Premium"
        },
        {
            "name": "Rahul",
            "orders": 10,
            "spent": 25000,
            "status": "Active"
        },
        {
            "name": "Anitha",
            "orders": 10,
            "spent": 25000,
            "status": "Regular"
        }
    ]
    return Response(data)
