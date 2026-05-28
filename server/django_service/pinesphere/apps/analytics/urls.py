from django.urls import path
from .views import DailySalesView, ShiftSummaryView, TopItemsView

urlpatterns = [
    path('reports/daily-sales/', DailySalesView.as_view(), name='daily-sales'),
    path('reports/shift/', ShiftSummaryView.as_view(), name='shift-summary'),
    path('reports/top-items/', TopItemsView.as_view(), name='top-items'),
]
