import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
try:
    u = User.objects.get(username='admin')
    u.set_password('Admin@123')
    u.save()
    print('Password set to Admin@123')
except User.DoesNotExist:
    u = User.objects.create_superuser('admin', 'admin@voicebridge.local', 'Admin@123')
    print('Superuser created with password Admin@123')
