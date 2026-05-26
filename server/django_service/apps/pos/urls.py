from django.urls import path

from .views import restaurants_list


urlpatterns = [
    path("restaurants/", restaurants_list, name="restaurants_list"),
]

