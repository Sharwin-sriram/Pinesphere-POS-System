from django.urls import path

from .views import (
    restaurants_list,
    restaurant_detail,
    restaurant_menu,
    toggle_favorite,
    restaurant_menu_list,
    restaurant_menu_detail,
    restaurant_categories_list,
    restaurant_category_detail,
    upload_image,
    restaurant_tables_list,
    restaurant_table_detail,
    restaurant_table_orders,
    restaurant_table_order_detail,
    restaurant_table_bill,
)

# Import staff views from staff_views module
from .staff_views import (
    restaurant_staff_list,
    restaurant_staff_detail,
    check_staff_email,
    check_staff_pin,
    restaurant_roles_list,
    restaurant_role_detail,
    restaurant_shifts_list,
)

# Import cart views from cart_views module
from .cart_views import (
    get_cart,
    add_to_cart,
    update_cart_item,
    remove_from_cart,
    clear_cart,
    checkout_cart,
)


urlpatterns = [
    # Customer ordering endpoints
    path("restaurants/", restaurants_list, name="restaurants_list"),
    path("restaurants/<str:pk>/", restaurant_detail, name="restaurant_detail"),
    path("restaurants/<str:pk>/menu/", restaurant_menu, name="restaurant_menu"),
    path("restaurants/<str:pk>/favorite/", toggle_favorite, name="toggle_favorite"),
    
    # Cart endpoints
    path("cart/", get_cart, name="get_cart"),
    path("cart/add/", add_to_cart, name="add_to_cart"),
    path("cart/items/<int:item_id>/", update_cart_item, name="update_cart_item"),
    path("cart/items/<int:item_id>/remove/", remove_from_cart, name="remove_from_cart"),
    path("cart/clear/", clear_cart, name="clear_cart"),
    path("cart/checkout/", checkout_cart, name="checkout_cart"),
    
    # Restaurant admin endpoints
    path("restaurant/<str:pk>/menu/", restaurant_menu_list, name="restaurant_menu_list"),
    path("restaurant/<str:pk>/menu/<str:item_id>/", restaurant_menu_detail, name="restaurant_menu_detail"),
    path("restaurant/<str:pk>/categories/", restaurant_categories_list, name="restaurant_categories_list"),
    path("restaurant/<str:pk>/categories/<str:cat_id>/", restaurant_category_detail, name="restaurant_category_detail"),
    path("restaurant/<str:pk>/tables/", restaurant_tables_list, name="restaurant_tables_list"),
    path("restaurant/<str:pk>/tables/<str:table_id>/", restaurant_table_detail, name="restaurant_table_detail"),
    path("restaurant/<str:pk>/tables/<str:table_id>/orders/", restaurant_table_orders, name="restaurant_table_orders"),
    path("restaurant/<str:pk>/tables/<str:table_id>/orders/<str:order_id>/", restaurant_table_order_detail, name="restaurant_table_order_detail"),
    path("restaurant/<str:pk>/tables/<str:table_id>/bill/", restaurant_table_bill, name="restaurant_table_bill"),
    
    # Staff management endpoints
    path("restaurant/<str:pk>/staff/", restaurant_staff_list, name="restaurant_staff_list"),
    path("restaurant/<str:pk>/staff/check-email/", check_staff_email, name="check_staff_email"),
    path("restaurant/<str:pk>/staff/check-pin/", check_staff_pin, name="check_staff_pin"),
    path("restaurant/<str:pk>/staff/<str:staff_id>/", restaurant_staff_detail, name="restaurant_staff_detail"),
    
    # Roles management endpoints
    path("restaurant/<str:pk>/roles/", restaurant_roles_list, name="restaurant_roles_list"),
    path("restaurant/<str:pk>/roles/<str:role_id>/", restaurant_role_detail, name="restaurant_role_detail"),
    
    # Shifts lookup endpoint
    path("restaurant/<str:pk>/shifts/", restaurant_shifts_list, name="restaurant_shifts_list"),
    
    path("upload/", upload_image, name="upload_image"),
]




