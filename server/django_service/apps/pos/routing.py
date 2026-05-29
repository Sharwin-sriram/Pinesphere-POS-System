from django.urls import re_path
from .websockets.consumers import TableConsumer

websocket_urlpatterns = [
    re_path(r"^ws/restaurant/(?P<restaurant_id>[a-zA-Z0-9_\-]+)/tables/$", TableConsumer.as_asgi()),
]
