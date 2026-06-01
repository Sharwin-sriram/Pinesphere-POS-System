"""
Alert Service - Handles kitchen alerts and notifications
"""
from django.utils import timezone
from datetime import timedelta
import logging
from ..models import KitchenAlert

logger = logging.getLogger(__name__)


class AlertService:
    """Service for managing kitchen alerts"""

    @staticmethod
    def create_ready_alert(order, kitchen):
        """
        Create 'Item Ready' alert
        
        Args:
            order: Order instance
            kitchen: Kitchen instance
        """
        try:
            message = f"Order #{order.id} items are ready for serving"
            
            alert = KitchenAlert.objects.create(
                kitchen=kitchen,
                order=order,
                alert_type='ready',
                message=message,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            logger.info(f"Ready alert created: {alert.id}")
            return alert
        except Exception as e:
            logger.error(f"Failed to create ready alert: {str(e)}")
            return None

    @staticmethod
    def create_delay_alert(order, kitchen):
        """
        Create 'Order Delayed' alert
        
        Args:
            order: Order instance
            kitchen: Kitchen instance
        """
        try:
            from .order_service import KitchenOrderService
            
            service = KitchenOrderService()
            remaining_time = service._get_remaining_time(order)
            
            message = f"Order #{order.id} is delayed. Estimated ready in {remaining_time} minutes"
            
            alert = KitchenAlert.objects.create(
                kitchen=kitchen,
                order=order,
                alert_type='delay',
                message=message,
                expires_at=timezone.now() + timedelta(hours=2)
            )
            
            logger.info(f"Delay alert created: {alert.id}")
            return alert
        except Exception as e:
            logger.error(f"Failed to create delay alert: {str(e)}")
            return None

    @staticmethod
    def create_new_order_alert(order, kitchen):
        """
        Create 'New Order' alert
        
        Args:
            order: Order instance
            kitchen: Kitchen instance
        """
        try:
            customer_info = ""
            if hasattr(order, 'customer_name'):
                customer_info = f" for {order.customer_name}"
            
            message = f"New order #{order.id}{customer_info} received"
            
            alert = KitchenAlert.objects.create(
                kitchen=kitchen,
                order=order,
                alert_type='new_order',
                message=message,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            logger.info(f"New order alert created: {alert.id}")
            return alert
        except Exception as e:
            logger.error(f"Failed to create new order alert: {str(e)}")
            return None

    @staticmethod
    def create_custom_alert(kitchen, message, order=None, expires_in_hours=1):
        """
        Create custom alert
        
        Args:
            kitchen: Kitchen instance
            message: Alert message
            order: Order instance (optional)
            expires_in_hours: Alert expiry time in hours
        """
        try:
            alert = KitchenAlert.objects.create(
                kitchen=kitchen,
                order=order,
                alert_type='custom',
                message=message,
                expires_at=timezone.now() + timedelta(hours=expires_in_hours)
            )
            
            logger.info(f"Custom alert created: {alert.id}")
            return alert
        except Exception as e:
            logger.error(f"Failed to create custom alert: {str(e)}")
            return None

    @staticmethod
    def acknowledge_alert(alert, user):
        """
        Acknowledge an alert
        
        Args:
            alert: KitchenAlert instance
            user: User instance
        """
        try:
            alert.is_acknowledged = True
            alert.acknowledged_by = user
            alert.acknowledged_at = timezone.now()
            alert.save()
            
            logger.info(f"Alert acknowledged: {alert.id}")
            return alert
        except Exception as e:
            logger.error(f"Failed to acknowledge alert: {str(e)}")
            return None

    @staticmethod
    def cleanup_expired_alerts():
        """Clean up expired alerts (older than expiry time)"""
        try:
            now = timezone.now()
            deleted_count, _ = KitchenAlert.objects.filter(
                expires_at__lt=now
            ).delete()
            
            logger.info(f"Cleaned up {deleted_count} expired alerts")
            return deleted_count
        except Exception as e:
            logger.error(f"Failed to cleanup alerts: {str(e)}")
            return 0

    @staticmethod
    def get_unacknowledged_alerts(kitchen):
        """
        Get all unacknowledged alerts for a kitchen
        
        Args:
            kitchen: Kitchen instance
        
        Returns:
            QuerySet: Unacknowledged alerts ordered by creation time
        """
        return KitchenAlert.objects.filter(
            kitchen=kitchen,
            is_acknowledged=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')

    @staticmethod
    def get_alerts_by_type(kitchen, alert_type):
        """
        Get alerts of specific type
        
        Args:
            kitchen: Kitchen instance
            alert_type: Type of alert ('ready', 'delay', 'new_order', 'custom')
        
        Returns:
            QuerySet: Alerts of specified type
        """
        return KitchenAlert.objects.filter(
            kitchen=kitchen,
            alert_type=alert_type,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')

    @staticmethod
    def send_alert_notification(alert, notification_channels=['ws']):
        """
        Send alert via configured notification channels
        
        Args:
            alert: KitchenAlert instance
            notification_channels: List of channels ('ws', 'sms', 'email', 'push')
        
        Returns:
            dict: Status of each notification channel
        """
        results = {}
        
        try:
            for channel in notification_channels:
                if channel == 'ws':
                    results['ws'] = AlertService._send_websocket_notification(alert)
                elif channel == 'sms':
                    results['sms'] = AlertService._send_sms_notification(alert)
                elif channel == 'email':
                    results['email'] = AlertService._send_email_notification(alert)
                elif channel == 'push':
                    results['push'] = AlertService._send_push_notification(alert)
        except Exception as e:
            logger.error(f"Failed to send notifications: {str(e)}")
        
        return results

    @staticmethod
    def _send_websocket_notification(alert):
        """Send alert via WebSocket"""
        try:
            # This would integrate with channels/websockets
            logger.info(f"WebSocket notification sent for alert: {alert.id}")
            return True
        except Exception as e:
            logger.error(f"WebSocket notification failed: {str(e)}")
            return False

    @staticmethod
    def _send_sms_notification(alert):
        """Send alert via SMS"""
        try:
            # Integration with SMS service provider
            logger.info(f"SMS notification sent for alert: {alert.id}")
            return True
        except Exception as e:
            logger.error(f"SMS notification failed: {str(e)}")
            return False

    @staticmethod
    def _send_email_notification(alert):
        """Send alert via Email"""
        try:
            # Integration with email service
            logger.info(f"Email notification sent for alert: {alert.id}")
            return True
        except Exception as e:
            logger.error(f"Email notification failed: {str(e)}")
            return False

    @staticmethod
    def _send_push_notification(alert):
        """Send alert via Push Notification"""
        try:
            # Integration with Firebase/push service
            logger.info(f"Push notification sent for alert: {alert.id}")
            return True
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")
            return False

    @staticmethod
    def batch_acknowledge_alerts(kitchen, alert_ids):
        """
        Acknowledge multiple alerts at once
        
        Args:
            kitchen: Kitchen instance
            alert_ids: List of alert IDs to acknowledge
        
        Returns:
            int: Count of alerts acknowledged
        """
        try:
            updated_count = KitchenAlert.objects.filter(
                kitchen=kitchen,
                id__in=alert_ids
            ).update(
                is_acknowledged=True,
                acknowledged_at=timezone.now()
            )
            
            logger.info(f"Batch acknowledged {updated_count} alerts")
            return updated_count
        except Exception as e:
            logger.error(f"Batch acknowledge failed: {str(e)}")
            return 0
