# Kitchen Display System (KDS) Backend - Installation Guide

## Overview
This guide provides complete setup instructions for the Kitchen Display System backend module.

## System Requirements

- Python 3.8+
- Django 3.2+
- Django REST Framework
- Django Channels 3.0+ (for WebSocket support)
- Channels Redis 3.0+ (for production)
- PostgreSQL 12+ (recommended for production)

## Installation Steps

### 1. Prerequisites

Ensure the following packages are installed:

```bash
# Core dependencies
pip install Django>=3.2
pip install djangorestframework>=3.12
pip install django-cors-headers
pip install python-dotenv

# Real-time WebSocket support
pip install channels>=3.0
pip install channels-redis>=3.0

# Printer support (optional)
pip install python-escpos  # For thermal printers
pip install pyserial       # For serial connections

# Testing
pip install pytest
pip install pytest-django
```

### 2. Add to Django Project

#### Update `settings.py`

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'corsheaders',
    'channels',
    
    # Local apps
    'apps.authentication',
    'apps.orders',
    'apps.kitchen_display_system',  # Add this
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Channels Configuration (for WebSocket support)
ASGI_APPLICATION = 'config.asgi.application'

# Development (in-memory channel layer)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

# Production (with Redis)
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             'hosts': [('127.0.0.1', 6379)],
#         },
#     },
# }

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/kds.log',
        },
    },
    'loggers': {
        'apps.kitchen_display_system': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
    },
}
```

#### Update `urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('kitchen/', include('apps.kitchen_display_system.urls')),
        path('auth/', include('apps.authentication.urls')),
        path('orders/', include('apps.orders.urls')),
    ])),
]
```

#### Update `asgi.py` (for WebSocket support)

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

# Import after django setup
from apps.kitchen_display_system.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
```

### 3. Database Migrations

```bash
# Create migrations for KDS
python manage.py makemigrations kitchen_display_system

# Apply migrations
python manage.py migrate kitchen_display_system
```

### 4. Create Initial Data (Optional)

```bash
# Load sample kitchen data
python manage.py loaddata kitchen_display_system/fixtures/sample_data.json
```

### 5. Run Tests

```bash
# Run KDS tests
python manage.py test apps.kitchen_display_system

# Run with coverage
pip install coverage
coverage run --source='apps.kitchen_display_system' manage.py test apps.kitchen_display_system
coverage report
```

## Configuration

### KitchenDisplaySystem Settings

Configure via Django admin or programmatically:

```python
from apps.kitchen_display_system.models import KitchenDisplaySystem

kds = KitchenDisplaySystem.objects.create(
    restaurant=restaurant,
    branch=branch,
    is_active=True,
    enable_sound_alerts=True,
    enable_ready_alerts=True,
    auto_kot_printing=True,
    preparation_time_default=15  # minutes
)
```

### Printer Setup

```python
from apps.kitchen_display_system.models import PrinterConfiguration

# Thermal Printer (USB)
printer = PrinterConfiguration.objects.create(
    kds=kds,
    name='Kitchen Thermal Printer',
    printer_type='thermal',
    connection_type='usb',
    printer_address='COM1',  # Windows
    # printer_address='/dev/ttyUSB0',  # Linux
    is_active=True,
    is_default=True
)

# Network Printer (TCP/IP)
network_printer = PrinterConfiguration.objects.create(
    kds=kds,
    name='Kitchen Network Printer',
    printer_type='thermal',
    connection_type='lan',
    printer_address='192.168.1.100',
    port_number=9100,
    is_active=True
)
```

## Running the Development Server

### With WebSocket Support

```bash
# Option 1: Using Uvicorn (recommended for development)
pip install uvicorn
uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --reload

# Option 2: Using Daphne
pip install daphne
python manage.py runserver  # With ASGI_APPLICATION configured
```

### Traditional Django Development Server (without WebSocket)

```bash
python manage.py runserver
```

## Production Deployment

### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD python manage.py migrate && \
    uvicorn config.asgi:application --host 0.0.0.0 --port 8000
```

### Using Gunicorn + Nginx

```bash
# Install
pip install gunicorn

# Run
gunicorn config.wsgi:application \
    --workers 4 \
    --worker-class sync \
    --bind 0.0.0.0:8000 \
    --timeout 120
```

### Redis Setup

```bash
# Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis
```

## Maintenance

### Cleanup Expired Data

```bash
# Cleanup expired alerts and old print logs
python manage.py cleanup_kds --days 7

# Dry run to see what would be deleted
python manage.py cleanup_kds --days 7 --dry-run
```

### Monitor Logs

```bash
# Watch KDS logs in real-time
tail -f logs/kds.log

# Check recent errors
grep ERROR logs/kds.log | tail -20
```

## Troubleshooting

### WebSocket Connection Issues

1. Check if Channels is installed: `pip list | grep channels`
2. Verify ASGI_APPLICATION is set in settings.py
3. Check Redis connection (production): `redis-cli ping`
4. Look for errors in logs: `grep -i websocket logs/kds.log`

### Printer Connection Issues

1. Test printer connection via API:
   ```
   POST /api/kitchen/printers/{printer_id}/test_connection/
   ```

2. Check printer address and port
3. Verify printer is powered on and connected
4. Check network connectivity: `ping printer_address`
5. Test with print service: `PrinterService.test_connection(printer)`

### Database Issues

1. Check migrations: `python manage.py showmigrations kitchen_display_system`
2. Apply pending migrations: `python manage.py migrate`
3. Check database connection in settings.py

### Performance Issues

1. Enable query logging
2. Check database indexes
3. Monitor Redis memory (if used)
4. Check WebSocket connection count

## API Testing

### Using cURL

```bash
# Get KDS systems
curl -H "Authorization: Token YOUR_TOKEN" \
     http://localhost:8000/api/kitchen/systems/

# Create KOT
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"order_id": "order-uuid", "kitchen_id": "kitchen-uuid"}' \
     http://localhost:8000/api/kitchen/kots/

# Test printer
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
     http://localhost:8000/api/kitchen/printers/printer-uuid/test_connection/
```

### Using Python Requests

```python
import requests

# Get KDS systems
response = requests.get(
    'http://localhost:8000/api/kitchen/systems/',
    headers={'Authorization': f'Token {token}'}
)

# Create alert
response = requests.post(
    'http://localhost:8000/api/kitchen/alerts/',
    headers={'Authorization': f'Token {token}'},
    json={
        'kitchen': 'kitchen-uuid',
        'alert_type': 'ready',
        'message': 'Order is ready'
    }
)
```

## Next Steps

1. Set up frontend application
2. Configure WebSocket connection in frontend
3. Implement kitchen display UI
4. Configure printers
5. Test end-to-end workflow
6. Deploy to production

## Support & Documentation

- Main README: See [README.md](README.md)
- API Documentation: Available at `/api/docs/` (with DRF)
- Troubleshooting: Check logs in `logs/kds.log`
- Issues: Report via project issue tracker

## Security Checklist

- [ ] Change default Django secret key
- [ ] Set DEBUG=False in production
- [ ] Configure allowed hosts
- [ ] Enable HTTPS/SSL
- [ ] Set up database encryption
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up authentication
- [ ] Regular security updates
- [ ] Backup database regularly
