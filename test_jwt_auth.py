#!/usr/bin/env python
"""Test JWT authentication"""
import os
import sys
import django
import json

# Add backend directory to path
sys.path.insert(0, 'c:\\Users\\vncea\\OneDrive\\Desktop\\react\\my-react-app\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import requests
from django.contrib.auth.models import User
from api.models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken

BASE_URL = 'http://localhost:8000/api'

print("Testing JWT Authentication...")
print("=" * 60)

# Step 1: Login and get token
print("\n1. Testing Login (POST /auth/login/):")
login_data = {
    'email': 'admin@skymall.com',
    'password': 'admin123'  # You may need to adjust this
}

try:
    response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"   ✓ Token received: {token[:50]}...")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")
    # Try using Django shell to get token instead
    print("\n   Generating token directly from Django...")
    admin = User.objects.filter(email='admin@skymall.com').first()
    if admin:
        refresh = RefreshToken.for_user(admin)
        token = str(refresh.access_token)
        print(f"   ✓ Token generated: {token[:50]}...")
    else:
        print("   ✗ Admin user not found")
        sys.exit(1)

# Step 2: Test accessing users endpoint with token
print("\n2. Testing GET /api/users/ (with token):")
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

try:
    response = requests.get(f'{BASE_URL}/users/', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success! Got users: {data}")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Step 3: Test creating a user
print("\n3. Testing POST /api/users/ (create user):")
new_user_data = {
    'email': 'createtest@example.com',
    'firstName': 'Create',
    'lastName': 'Test',
    'role': 'staff',
    'phone': '555-9999',
    'password': 'testpass123'
}

try:
    response = requests.post(f'{BASE_URL}/users/', json=new_user_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"   ✓ User created: {data.get('email')}")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Step 4: Verify admin user profile
print("\n4. Checking Admin User Profile:")
admin = User.objects.filter(email='admin@skymall.com').first()
if admin:
    profile = UserProfile.objects.filter(user=admin).first()
    if profile:
        print(f"   ✓ Admin profile found")
        print(f"     - role: {profile.role}")
        print(f"     - is_staff: {admin.is_staff}")
        print(f"     - is_superuser: {admin.is_superuser}")
    else:
        print(f"   ✗ Admin profile NOT found!")
else:
    print(f"   ✗ Admin user NOT found!")

print("\n" + "=" * 60)
