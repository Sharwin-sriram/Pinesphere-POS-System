from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login, name="waiter-login"),
    path("menu/", views.menu_list, name="waiter-menu"),
    path("orders/", views.take_order, name="waiter-take-order"),
    path("orders/<str:order_id>/cancel_item/", views.cancel_item, name="waiter-cancel-item"),
]
