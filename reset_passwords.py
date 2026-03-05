#!/usr/bin/env python
"""Reset admin password"""
import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, 'c:\\Users\\vncea\\OneDrive\\Desktop\\react\\my-react-app\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

print("Resetting Admin Password...")
print("=" * 60)

# Find admin user
admin = User.objects.filter(email='admin@skymall.com').first()

if admin:
    # Set new password
    new_password = 'admin123'
    admin.set_password(new_password)
    admin.save()
    print(f"✓ Admin password reset to: {new_password}")
    print(f"  Email: admin@skymall.com")
    print(f"  Password: {new_password}")
else:
    print("✗ Admin user not found!")

# Also create/reset staff user
staff = User.objects.filter(email='staff@skymall.com').first()
if staff:
    staff.set_password('staff123')
    staff.save()
    print(f"\n✓ Staff password reset to: staff123")
    print(f"  Email: staff@skymall.com")
    print(f"  Password: staff123")

# Also create/reset tenant user
tenant = User.objects.filter(email='tenant@skymall.com').first()
if tenant:
    tenant.set_password('tenant123')
    tenant.save()
    print(f"\n✓ Tenant password reset to: tenant123")
    print(f"  Email: tenant@skymall.com")
    print(f"  Password: tenant123")

print("\n" + "=" * 60)
print("✓ All passwords reset successfully!")
print("\nYou can now login with:")
print("  Admin:  admin@skymall.com / admin123")
print("  Staff:  staff@skymall.com / staff123")
print("  Tenant: tenant@skymall.com / tenant123")
