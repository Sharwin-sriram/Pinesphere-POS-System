from django.urls import path

from .views import restaurants_list, restaurant_detail, restaurant_menu, toggle_favorite


urlpatterns = [
    path("restaurants/", restaurants_list, name="restaurants_list"),
    path("restaurants/<str:pk>/", restaurant_detail, name="restaurant_detail"),
    path("restaurants/<str:pk>/menu/", restaurant_menu, name="restaurant_menu"),
    path("restaurants/<str:pk>/favorite/", toggle_favorite, name="toggle_favorite"),
]


