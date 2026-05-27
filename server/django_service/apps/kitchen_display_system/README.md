# Kitchen Display System (KDS) Backend

Complete backend implementation for Kitchen Management and Display System with real-time order synchronization, KOT printing, and kitchen operations management.

## Features

### Core Features
- **Kitchen Display System**: Real-time order management and display
- **Kitchen Order Tickets (KOT)**: Department-wise KOT generation and management
- **Order Status Tracking**: Track orders through multiple kitchen states
- **Preparation Timers**: Automatic timing of order preparation
- **Order Prioritization**: Set and manage order priorities
- **Kitchen Alerts**: Real-time alerts for ready items, delays, etc.
- **Printer Management**: Support for thermal, network, and Bluetooth printers

### Kitchen Management
- Multiple kitchens per restaurant
- Kitchen departments (Grill, Fry, Dessert, Bar, etc.)
- Order routing by department
- Kitchen-wise configuration

### Order Management
- Real-time order synchronization
- Order status management (New → Preparing → Ready → Served)
- Delayed order tracking and alerts
- Order priority management
- Cancel and edit KOT functionality

### Printer Operations
- **Thermal Printer Support**: 80mm thermal printing
- **Department-wise Printing**: Route to specific printers
- **Auto KOT Printing**: Automatic printing when enabled
- **Reprint Functionality**: Reprint KOTs as needed
- **Print Logging**: Track all print operations

### Real-time Features
- WebSocket-based real-time synchronization
- Live order updates across kitchen staff
- Instant alert delivery
- Browser push notifications (optional)

## Architecture

### Models

1. **KitchenDisplaySystem**: Main KDS configuration per restaurant
2. **Kitchen**: Physical kitchen location
3. **KitchenDepartment**: Department within kitchen (Grill, Fry, etc.)
4. **KitchenOrderStatus**: Tracks order status through kitchen workflow
5. **KitchenOrderTicket**: Kitchen Order Ticket (KOT)
6. **PreparationTimer**: Tracks preparation time per order
7. **PrinterConfiguration**: Printer setup and configuration
8. **KOTPrintLog**: Log of all KOT print operations
9. **OrderPriority**: Priority management for orders
10. **KitchenAlert**: Kitchen alerts and notifications

### Services

#### 1. OrderService (`services/order_service.py`)
Handles kitchen order operations:
- Create kitchen orders and KOTs
- Update order status
- Get kitchen dashboard data
- Get orders by priority
- Calculate kitchen metrics

**Key Methods:**
```python
create_kitchen_order(order, kitchen, department=None)
update_order_status(order, new_status, kitchen=None, notes='')
stop_preparation_timer(order, kitchen_status=None)
get_kitchen_dashboard(kitchen_id)
get_order_by_priority(kitchen)
mark_order_as_delayed(order, kitchen=None, reason='')
get_kitchen_metrics(kitchen, days=1)
```

#### 2. PrinterService (`services/printer_service.py`)
Manages printer operations:
- Test printer connections
- Print KOTs to physical printers
- Generate KOT content
- Auto-print functionality
- Print logging

**Key Methods:**
```python
test_connection(printer)
print_kot(kot, printer, is_reprint=False)
auto_print_kot(kot, kds)
get_default_printer(kitchen)
```

#### 3. AlertService (`services/alert_service.py`)
Manages kitchen alerts:
- Create different types of alerts (ready, delay, new order)
- Acknowledge alerts
- Send notifications via multiple channels
- Clean up expired alerts

**Key Methods:**
```python
create_ready_alert(order, kitchen)
create_delay_alert(order, kitchen)
create_new_order_alert(order, kitchen)
acknowledge_alert(alert, user)
get_unacknowledged_alerts(kitchen)
send_alert_notification(alert, channels=['ws'])
```

## API Endpoints

### Kitchen Display System
```
GET    /api/kitchen/systems/                    # List KDS
POST   /api/kitchen/systems/                    # Create KDS
GET    /api/kitchen/systems/{id}/               # Retrieve KDS
PATCH  /api/kitchen/systems/{id}/               # Update KDS
DELETE /api/kitchen/systems/{id}/               # Delete KDS
POST   /api/kitchen/systems/{id}/toggle_sound_alerts/     # Toggle sound
POST   /api/kitchen/systems/{id}/toggle_ready_alerts/     # Toggle ready alerts
```

### Kitchens
```
GET    /api/kitchen/kitchens/                   # List kitchens
POST   /api/kitchen/kitchens/                   # Create kitchen
GET    /api/kitchen/kitchens/{id}/              # Retrieve kitchen
PATCH  /api/kitchen/kitchens/{id}/              # Update kitchen
DELETE /api/kitchen/kitchens/{id}/              # Delete kitchen
GET    /api/kitchen/kitchens/{id}/get_pending_orders/    # Get pending orders
```

### Kitchen Order Tickets (KOT)
```
GET    /api/kitchen/kots/                       # List KOTs
POST   /api/kitchen/kots/                       # Create KOT
GET    /api/kitchen/kots/{id}/                  # Retrieve KOT
PATCH  /api/kitchen/kots/{id}/                  # Update KOT
DELETE /api/kitchen/kots/{id}/                  # Delete KOT
POST   /api/kitchen/kots/{id}/print_kot/        # Print KOT
POST   /api/kitchen/kots/{id}/reprint_kot/      # Reprint KOT
POST   /api/kitchen/kots/{id}/cancel_kot/       # Cancel KOT
POST   /api/kitchen/kots/{id}/edit_kot/         # Edit KOT
GET    /api/kitchen/kots/by_status/             # Get KOTs by status
```

### Order Status
```
GET    /api/kitchen/order-status/               # List order status
GET    /api/kitchen/order-status/{id}/          # Retrieve status
PATCH  /api/kitchen/order-status/{id}/          # Update status
POST   /api/kitchen/order-status/{id}/mark_as_preparing/   # Mark preparing
POST   /api/kitchen/order-status/{id}/mark_as_ready/       # Mark ready
POST   /api/kitchen/order-status/{id}/mark_as_delayed/     # Mark delayed
POST   /api/kitchen/order-status/{id}/mark_as_served/      # Mark served
```

### Kitchen Alerts
```
GET    /api/kitchen/alerts/                     # List alerts
POST   /api/kitchen/alerts/                     # Create alert
GET    /api/kitchen/alerts/{id}/                # Retrieve alert
PATCH  /api/kitchen/alerts/{id}/                # Update alert
POST   /api/kitchen/alerts/{id}/acknowledge/    # Acknowledge alert
GET    /api/kitchen/alerts/unacknowledged/      # Get unacknowledged
```

### Printers
```
GET    /api/kitchen/printers/                   # List printers
POST   /api/kitchen/printers/                   # Create printer
GET    /api/kitchen/printers/{id}/              # Retrieve printer
PATCH  /api/kitchen/printers/{id}/              # Update printer
DELETE /api/kitchen/printers/{id}/              # Delete printer
POST   /api/kitchen/printers/{id}/test_connection/        # Test connection
```

### Dashboard
```
GET    /api/kitchen/dashboard/summary/          # Get kitchen summary
```

## WebSocket API

### Connection
```
WebSocket: ws://localhost/ws/kitchen/<kitchen_id>/
```

### Message Types

#### Client → Server

1. **Sync Request**
```json
{
  "type": "sync_request"
}
```

2. **Order Status Update**
```json
{
  "type": "order_status_update",
  "order_id": "order-uuid",
  "status": "preparing"
}
```

3. **Mark Order Ready**
```json
{
  "type": "mark_ready",
  "order_id": "order-uuid"
}
```

4. **Acknowledge Alert**
```json
{
  "type": "acknowledge_alert",
  "alert_id": "alert-uuid"
}
```

5. **Get Alerts**
```json
{
  "type": "get_alerts"
}
```

#### Server → Client

1. **Kitchen Sync**
```json
{
  "type": "kitchen_sync",
  "data": {
    "kitchen_id": "kitchen-uuid",
    "kitchen_name": "Main Kitchen",
    "pending_orders": [...],
    "preparing_orders": [...],
    "alerts": [...]
  }
}
```

2. **Order Status Changed**
```json
{
  "type": "order_status_changed",
  "order_id": "order-uuid",
  "status": "preparing",
  "timestamp": "2024-01-01T10:30:00Z"
}
```

3. **New Alert**
```json
{
  "type": "new_alert",
  "alert": {
    "id": "alert-uuid",
    "type": "ready",
    "message": "Order #123 items are ready"
  },
  "timestamp": "2024-01-01T10:30:00Z"
}
```

## Setup & Installation

### 1. Add to Django Settings

```python
# settings.py
INSTALLED_APPS = [
    ...
    'apps.kitchen_display_system',
]

# WebSocket settings (if using Django Channels)
ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
```

### 2. Include URLs

```python
# urls.py
urlpatterns = [
    ...
    path('api/kitchen/', include('apps.kitchen_display_system.urls')),
]
```

### 3. Include WebSocket Routing

```python
# asgi.py
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.kitchen_display_system.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})
```

### 4. Run Migrations

```bash
python manage.py makemigrations kitchen_display_system
python manage.py migrate kitchen_display_system
```

## Usage Examples

### Create Kitchen and KDS

```python
from apps.kitchen_display_system.models import KitchenDisplaySystem, Kitchen

kds = KitchenDisplaySystem.objects.create(
    restaurant=restaurant,
    branch=branch,
    is_active=True,
    enable_sound_alerts=True,
    auto_kot_printing=True
)

kitchen = Kitchen.objects.create(
    kds=kds,
    name='Main Kitchen',
    kitchen_type='main'
)
```

### Create Order in Kitchen

```python
from apps.kitchen_display_system.services.order_service import KitchenOrderService

service = KitchenOrderService()
kitchen_status, kot = service.create_kitchen_order(
    order=order,
    kitchen=kitchen,
    department=department
)
```

### Update Order Status

```python
service.update_order_status(
    order=order,
    new_status='preparing',
    kitchen=kitchen,
    notes='Started preparation'
)
```

### Create Alert

```python
from apps.kitchen_display_system.services.alert_service import AlertService

AlertService.create_ready_alert(order, kitchen)
```

### Print KOT

```python
from apps.kitchen_display_system.services.printer_service import PrinterService

PrinterService.print_kot(kot, printer)
```

## Security & Permissions

- Authentication required for all endpoints
- Permission checks on restaurant/branch level
- User roles: Kitchen Staff, Manager, Admin
- Audit logging for all KOT operations

## Performance Optimization

- Indexed queries on frequently accessed fields
- Real-time sync via WebSockets (reduces polling)
- Batch alert acknowledgement
- Auto-cleanup of expired alerts
- Connection pooling for network printers

## Error Handling

- Graceful fallback if printer unavailable
- Automatic retry logic for failed operations
- Detailed error logging
- User-friendly error messages via API

## Future Enhancements

- [ ] AI-based preparation time prediction
- [ ] Voice alerts support
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Preparation analytics and reporting
- [ ] Kitchen staff assignment optimization
- [ ] Integration with smart kitchen devices

## Support

For issues or questions, contact the development team or refer to the main Pinesphere POS documentation.
