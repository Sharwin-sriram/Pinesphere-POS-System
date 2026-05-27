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


urlpatterns = [
    # Customer ordering endpoints
    path("restaurants/", restaurants_list, name="restaurants_list"),
    path("restaurants/<str:pk>/", restaurant_detail, name="restaurant_detail"),
    path("restaurants/<str:pk>/menu/", restaurant_menu, name="restaurant_menu"),
    path("restaurants/<str:pk>/favorite/", toggle_favorite, name="toggle_favorite"),
    
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
    path("upload/", upload_image, name="upload_image"),
]



