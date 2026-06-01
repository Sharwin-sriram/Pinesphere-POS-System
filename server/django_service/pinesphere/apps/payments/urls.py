from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/<str:provider>/', views.gateway_webhook, name='payments-webhook'),
    path('create-order/', views.OrderCreationView.as_view(), name='create-order'),
    path('verify/', views.PaymentVerificationView.as_view(), name='verify-payment'),
    path('webhook/', views.RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('refund/', views.RefundView.as_view(), name='refund-payment'),
]
