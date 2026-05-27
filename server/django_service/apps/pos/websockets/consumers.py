import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class TableConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for restaurant tables live occupancy and order updates.
    """
    async def connect(self):
        self.restaurant_id = self.scope['url_route']['kwargs'].get('restaurant_id')
        self.room_group_name = f"restaurant_{self.restaurant_id}_tables"

        # Join the restaurant tables group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"Table WebSocket connected for restaurant: {self.restaurant_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"Table WebSocket disconnected for restaurant: {self.restaurant_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            # Support basic ping/pong or client trigger if needed
            if data.get("type") == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
        except Exception as e:
            logger.error(f"Error reading websocket message: {str(e)}")

    async def table_broadcast(self, event):
        """
        Receive message from group and send to clients
        """
        await self.send(text_data=json.dumps(event["message"]))
