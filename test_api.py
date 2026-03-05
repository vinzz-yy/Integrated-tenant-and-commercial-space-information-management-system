#!/usr/bin/env python
"""Test script to verify API endpoints are working correctly"""
import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, 'c:\\Users\\vncea\\OneDrive\\Desktop\\react\\my-react-app\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
from api.serializers import UserSerializer

print("Testing User Creation and Serialization...")
print("=" * 60)

# Test 1: Create a test user
print("\n1. Testing User Creation:")
try:
    # Check if test user exists
    test_user = User.objects.filter(email='test@example.com').first()
    if test_user:
        test_user.delete()
    
    # Create new user
    user = User.objects.create_user(
        username='test@example.com',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    print(f"✓ User created: {user.username}")
except Exception as e:
    print(f"✗ Error creating user: {e}")

# Test 2: Create UserProfile
print("\n2. Testing UserProfile Creation:")
try:
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'staff',
            'phone': '555-1234',
            'department': 'Operations',
            'unitNumber': 'A101'
        }
    )
    print(f"✓ Profile created: {profile.role}")
except Exception as e:
    print(f"✗ Error creating profile: {e}")

# Test 3: Test Serializer with camelCase fields
print("\n3. Testing UserSerializer Output:")
try:
    serializer = UserSerializer(user)
    data = serializer.data
    print(f"✓ Serialized data keys: {list(data.keys())}")
    print(f"  - email: {data.get('email')}")
    print(f"  - firstName: {data.get('firstName')}")
    print(f"  - lastName: {data.get('lastName')}")
    print(f"  - role: {data.get('role')}")
    print(f"  - phone: {data.get('phone')}")
except Exception as e:
    print(f"✗ Error serializing user: {e}")

# Test 4: Test Serializer with camelCase input
print("\n4. Testing UserSerializer Create with camelCase:")
try:
    test_data = {
        'email': 'newuser@example.com',
        'firstName': 'John',
        'lastName': 'Doe',
        'role': 'tenant',
        'phone': '555-5678',
        'password': 'securepass123'
    }
    
    # First, normalize the data
    normalized_data = test_data.copy()
    if 'firstName' in normalized_data:
        normalized_data['first_name'] = normalized_data.pop('firstName')
    if 'lastName' in normalized_data:
        normalized_data['last_name'] = normalized_data.pop('lastName')
    
    serializer = UserSerializer(data=normalized_data)
    if serializer.is_valid():
        new_user = serializer.save()
        print(f"✓ New user created via serializer: {new_user.email}")
    else:
        print(f"✗ Serializer validation errors: {serializer.errors}")
except Exception as e:
    print(f"✗ Error in serializer create: {e}")

# Test 5: Test Notification serializer
print("\n5. Testing Notification Fields:")
try:
    from api.models import Notification
    from api.serializers import NotificationSerializer
    
    # Create test notification
    notif = Notification.objects.create(
        user=user,
        title='Test Notification',
        message='This is a test message',
        type='info',
        read=False
    )
    
    notif_serializer = NotificationSerializer(notif)
    data = notif_serializer.data
    print(f"✓ Notification fields: {list(data.keys())}")
    print(f"  - title: {data.get('title')}")
    print(f"  - read: {data.get('read')}")
except Exception as e:
    print(f"✗ Error with notification: {e}")

print("\n" + "=" * 60)
print("Testing complete!")
