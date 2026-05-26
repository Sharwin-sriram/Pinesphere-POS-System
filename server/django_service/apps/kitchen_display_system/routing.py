"""
WebSocket URL routing for Kitchen Display System
"""
from django.urls import re_path
from .websockets.consumers import KitchenDisplayConsumer

websocket_urlpatterns = [
    re_path(r'ws/kitchen/(?P<kitchen_id>[0-9a-f\-]+)/$', KitchenDisplayConsumer.as_asgi()),
]
