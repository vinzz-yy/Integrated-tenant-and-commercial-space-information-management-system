import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

# Create admin user
admin_user = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='admin123',
    first_name='Admin',
    last_name='User'
)
UserProfile.objects.create(user=admin_user, role='admin')

# Create staff user
staff_user = User.objects.create_user(
    username='staff',
    email='staff@example.com',
    password='staff123',
    first_name='Staff',
    last_name='User'
)
UserProfile.objects.create(user=staff_user, role='staff')

# Create tenant user
tenant_user = User.objects.create_user(
    username='tenant',
    email='tenant@example.com',
    password='tenant123',
    first_name='Tenant',
    last_name='User'
)
UserProfile.objects.create(user=tenant_user, role='tenant')

print("Users created successfully!")
print("Admin: admin@example.com / admin123")
print("Staff: staff@example.com / staff123")
print("Tenant: tenant@example.com / tenant123")