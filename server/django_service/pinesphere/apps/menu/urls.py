from django.urls import path
from .views import MenuForBranchView, PushMenuView

urlpatterns = [
    path('menu/branch/', MenuForBranchView.as_view(), name='menu-for-branch'),
    path('menu/push/', PushMenuView.as_view(), name='push-menu'),
]
