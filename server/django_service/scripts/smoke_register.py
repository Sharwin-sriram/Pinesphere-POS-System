import os
import sys
import json
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings')
import django
django.setup()

from django.test import Client

client = Client()

unique = uuid.uuid4().hex[:6]
email = f"test{unique}@example.com"
phone = f"+9112345{unique}"

payload = {
    "full_name": "Test Owner",
    "email": email,
    "password": "Testpass123!",
    "restaurant_name": f"SmokeTest Rest {unique}",
    "cuisine_types": ["Test"],
    "city": "TestCity",
    "phone": phone,
    "fssai_license": ""
}

resp = client.post('/api/restaurant/register/', data=json.dumps(payload), content_type='application/json')
print('STATUS:', resp.status_code)
try:
    print('RESPONSE:', resp.json())
except Exception:
    print('RESPONSE_TEXT:', resp.content.decode('utf-8'))

# exit code for CI
sys.exit(0 if 200 <= resp.status_code < 300 else 2)
