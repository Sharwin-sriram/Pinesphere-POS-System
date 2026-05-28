"""
WebSocket Consumers for Kitchen Display System - Real-time order synchronization
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Kitchen, KitchenOrderTicket, KitchenOrderStatus, KitchenAlert
from .serializers import (
    KitchenOrderTicketSerializer,
    KitchenOrderStatusSerializer,
    KitchenAlertSerializer,
)
import logging

logger = logging.getLogger(__name__)


class KitchenDisplayConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for Kitchen Display System"""

    async def connect(self):
        """Handle WebSocket connection"""
        self.kitchen_id = self.scope['url_route']['kwargs'].get('kitchen_id')
        self.room_group_name = f'kitchen_{self.kitchen_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"Kitchen WebSocket connected: {self.kitchen_id}")

        # Send current kitchen data
        kitchen_data = await self.get_kitchen_data()
        await self.send(text_data=json.dumps({
            'type': 'kitchen_sync',
            'data': kitchen_data
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"Kitchen WebSocket disconnected: {self.kitchen_id}")

    async def receive(self, text_data):
        """Handle messages from WebSocket client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'order_status_update':
                await self.handle_order_status_update(data)
            elif message_type == 'sync_request':
                await self.handle_sync_request(data)
            elif message_type == 'acknowledge_alert':
                await self.handle_acknowledge_alert(data)
            elif message_type == 'get_alerts':
                await self.handle_get_alerts(data)
            elif message_type == 'mark_ready':
                await self.handle_mark_ready(data)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_order_status_update(self, data):
        """Handle order status update"""
        order_id = data.get('order_id')
        new_status = data.get('status')

        result = await self.update_order_status_db(order_id, new_status)

        if result:
            # Broadcast to all users in kitchen
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'order_status_changed',
                    'order_id': order_id,
                    'status': new_status,
                    'timestamp': timezone.now().isoformat()
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to update order {order_id}'
            }))

    async def handle_sync_request(self, data):
        """Handle sync request from client"""
        kitchen_data = await self.get_kitchen_data()
        await self.send(text_data=json.dumps({
            'type': 'kitchen_sync',
            'data': kitchen_data
        }))

    async def handle_acknowledge_alert(self, data):
        """Handle alert acknowledgement"""
        alert_id = data.get('alert_id')
        user_id = self.scope['user'].id if self.scope['user'] else None

        result = await self.acknowledge_alert_db(alert_id, user_id)

        if result:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'alert_acknowledged',
                    'alert_id': alert_id,
                    'timestamp': timezone.now().isoformat()
                }
            )

    async def handle_get_alerts(self, data):
        """Get current alerts"""
        alerts = await self.get_kitchen_alerts()
        await self.send(text_data=json.dumps({
            'type': 'alerts',
            'data': alerts
        }))

    async def handle_mark_ready(self, data):
        """Mark order as ready"""
        order_id = data.get('order_id')
        result = await self.mark_order_ready_db(order_id)

        if result:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'order_ready',
                    'order_id': order_id,
                    'timestamp': timezone.now().isoformat()
                }
            )

    # Events sent to this consumer
    async def order_status_changed(self, event):
        """Handle order status changed event"""
        await self.send(text_data=json.dumps({
            'type': 'order_status_changed',
            'order_id': event['order_id'],
            'status': event['status'],
            'timestamp': event['timestamp']
        }))

    async def order_ready(self, event):
        """Handle order ready event"""
        await self.send(text_data=json.dumps({
            'type': 'order_ready',
            'order_id': event['order_id'],
            'timestamp': event['timestamp']
        }))

    async def alert_acknowledged(self, event):
        """Handle alert acknowledged event"""
        await self.send(text_data=json.dumps({
            'type': 'alert_acknowledged',
            'alert_id': event['alert_id'],
            'timestamp': event['timestamp']
        }))

    async def new_alert(self, event):
        """Handle new alert event"""
        await self.send(text_data=json.dumps({
            'type': 'new_alert',
            'alert': event['alert'],
            'timestamp': event['timestamp']
        }))

    async def kds_ticket_update(self, event):
        """Forward KDS ticket mutations (bump/recall/hold) to all board clients."""
        await self.send(text_data=event['payload'])

    # Database operations
    @database_sync_to_async
    def get_kitchen_data(self):
        """Get current kitchen data"""
        try:
            kitchen = Kitchen.objects.get(id=self.kitchen_id)

            # Get active KOTs
            pending_kots = KitchenOrderTicket.objects.filter(
                kitchen=kitchen,
                status='pending'
            ).order_by('created_at')

            printed_kots = KitchenOrderTicket.objects.filter(
                kitchen=kitchen,
                status='printed'
            ).order_by('created_at')

            # Get unacknowledged alerts
            alerts = KitchenAlert.objects.filter(
                kitchen=kitchen,
                is_acknowledged=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at')

            return {
                'kitchen_id': str(kitchen.id),
                'kitchen_name': kitchen.name,
                'pending_orders': list(KitchenOrderTicketSerializer(
                    pending_kots, many=True
                ).data),
                'preparing_orders': list(KitchenOrderTicketSerializer(
                    printed_kots, many=True
                ).data),
                'alerts': list(KitchenAlertSerializer(
                    alerts, many=True
                ).data),
                'timestamp': timezone.now().isoformat()
            }
        except Kitchen.DoesNotExist:
            return {}

    @database_sync_to_async
    def update_order_status_db(self, order_id, new_status):
        """Update order status in database"""
        try:
            order_status = KitchenOrderStatus.objects.filter(
                order_id=order_id,
                kitchen_id=self.kitchen_id
            ).latest('created_at')

            order_status.status = new_status
            if new_status == 'preparing':
                order_status.started_at = timezone.now()
            elif new_status in ['ready', 'served']:
                order_status.completed_at = timezone.now()

            order_status.save()
            return True
        except Exception as e:
            logger.error(f"Failed to update order status: {str(e)}")
            return False

    @database_sync_to_async
    def acknowledge_alert_db(self, alert_id, user_id):
        """Acknowledge alert in database"""
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()

            alert = KitchenAlert.objects.get(id=alert_id)
            alert.is_acknowledged = True
            alert.acknowledged_at = timezone.now()

            if user_id:
                alert.acknowledged_by = User.objects.get(id=user_id)

            alert.save()
            return True
        except Exception as e:
            logger.error(f"Failed to acknowledge alert: {str(e)}")
            return False

    @database_sync_to_async
    def get_kitchen_alerts(self):
        """Get kitchen alerts"""
        try:
            alerts = KitchenAlert.objects.filter(
                kitchen_id=self.kitchen_id,
                expires_at__gt=timezone.now()
            ).order_by('-created_at')

            return list(KitchenAlertSerializer(alerts, many=True).data)
        except Exception as e:
            logger.error(f"Failed to get alerts: {str(e)}")
            return []

    @database_sync_to_async
    def mark_order_ready_db(self, order_id):
        """Mark order as ready"""
        try:
            order_status = KitchenOrderStatus.objects.filter(
                order_id=order_id,
                kitchen_id=self.kitchen_id
            ).latest('created_at')

            order_status.status = 'ready'
            order_status.completed_at = timezone.now()
            order_status.save()

            return True
        except Exception as e:
            logger.error(f"Failed to mark order ready: {str(e)}")
            return False
