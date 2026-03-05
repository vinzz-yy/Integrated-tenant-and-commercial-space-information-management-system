#!/usr/bin/env python
"""Verify admin user permissions"""
import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, 'c:\\Users\\vncea\\OneDrive\\Desktop\\react\\my-react-app\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

print("Checking Admin User Permissions...")
print("=" * 60)

# Find admin user
admin = User.objects.filter(email='admin@skymall.com').first()

if admin:
    print(f"\n✓ Admin user found: {admin.username}")
    print(f"  - is_staff: {admin.is_staff}")
    print(f"  - is_superuser: {admin.is_superuser}")
    
    profile = admin.profile if hasattr(admin, 'profile') else None
    if profile:
        print(f"  - role: {profile.role}")
        print(f"  - phone: {profile.phone}")
        print(f"  - department: {profile.department}")
    else:
        print("  ✗ No profile found!")
else:
    print("✗ Admin user not found!")

# List all users
print("\n" + "=" * 60)
print("All Users:")
for user in User.objects.all():
    profile = user.profile if hasattr(user, 'profile') else None
    role = profile.role if profile else "N/A"
    print(f"  - {user.email} (role: {role})")

print("\n" + "=" * 60)
