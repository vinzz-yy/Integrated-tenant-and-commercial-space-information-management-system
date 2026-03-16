import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

# Create or update admin superuser
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@skymall.com', 'first_name': 'Admin', 'last_name': 'User'},
)
admin_user.email = 'admin@skymall.com'
admin_user.first_name = 'Admin'
admin_user.last_name = 'User'
admin_user.is_staff = True
admin_user.is_superuser = True
admin_user.set_password('admin123')
admin_user.save()
UserProfile.objects.get_or_create(user=admin_user, defaults={'role': 'admin'})

# Create or update staff user
staff_user, _ = User.objects.get_or_create(
    username='staff',
    defaults={'email': 'staff@skymall.com', 'first_name': 'Staff', 'last_name': 'User'},
)
staff_user.email = 'staff@skymall.com'
staff_user.first_name = 'Staff'
staff_user.last_name = 'User'
staff_user.set_password('staff123')
staff_user.save()
UserProfile.objects.get_or_create(user=staff_user, defaults={'role': 'staff'})

# Create or update tenant user
tenant_user, _ = User.objects.get_or_create(
    username='tenant',
    defaults={'email': 'tenant@skymall.com', 'first_name': 'Tenant', 'last_name': 'User'},
)
tenant_user.email = 'tenant@skymall.com'
tenant_user.first_name = 'Tenant'
tenant_user.last_name = 'User'
tenant_user.set_password('tenant123')
tenant_user.save()
UserProfile.objects.get_or_create(user=tenant_user, defaults={'role': 'tenant'})

print("Users ensured successfully!")
print("Admin (superuser): admin / admin123")
print("Staff: staff / staff123")
print("Tenant: tenant / tenant123")
