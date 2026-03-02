# Django Backend Integration Guide
## LA Union Skymall Property Management System

This document provides complete instructions for connecting this React frontend to your Django backend.

---

## Table of Contents
1. [Django Project Setup](#django-project-setup)
2. [Database Models](#database-models)
3. [API Endpoints](#api-endpoints)
4. [Authentication Setup](#authentication-setup)
5. [CORS Configuration](#cors-configuration)
6. [File Upload Configuration](#file-upload-configuration)
7. [Environment Variables](#environment-variables)

---

## Django Project Setup

### Required Django Packages

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary pillow python-dateutil
```

### Create `requirements.txt`:

```txt
Django==5.0.0
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
psycopg2-binary==2.9.9
Pillow==10.1.0
python-dateutil==2.8.2
```

### Django Settings Configuration (`settings.py`):

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Your apps
    'users',
    'compliance',
    'schedule',
    'operations',
    'financial',
    'commercial_spaces',
    'maintenance',
    'notifications',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Database Configuration (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'skymall_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Media Files Configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

---

## Database Models

### 1. Custom User Model (`users/models.py`)

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model with role-based access
    Roles: admin, staff, tenant
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('tenant', 'Tenant'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='tenant')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Staff specific fields
    department = models.CharField(max_length=100, blank=True, null=True)
    
    # Tenant specific fields
    unit_number = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.role})"
```

### 2. Compliance Document Model (`compliance/models.py`)

```python
from django.db import models
from django.conf import settings

class ComplianceDocument(models.Model):
    """
    Model for tenant compliance documents
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expiring_soon', 'Expiring Soon'),
    ]
    
    DOCUMENT_TYPE_CHOICES = [
        ('business_license', 'Business License'),
        ('insurance_certificate', 'Insurance Certificate'),
        ('fire_safety_certificate', 'Fire Safety Certificate'),
        ('health_permit', 'Health Permit'),
    ]
    
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='compliance_documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='compliance_documents/')
    upload_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_documents')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'compliance_documents'
        ordering = ['-upload_date']
    
    def __str__(self):
        return f"{self.tenant.username} - {self.document_type}"
```

### 3. Appointment Model (`schedule/models.py`)

```python
from django.db import models
from django.conf import settings

class Appointment(models.Model):
    """
    Model for scheduling appointments
    """
    TYPE_CHOICES = [
        ('meeting', 'Meeting'),
        ('inspection', 'Inspection'),
        ('maintenance', 'Maintenance'),
        ('viewing', 'Unit Viewing'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField()
    duration = models.CharField(max_length=50)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_appointments')
    attendees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='appointments')
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        ordering = ['date', 'time']
    
    def __str__(self):
        return f"{self.title} - {self.date}"
```

### 4. Operation Request Model (`operations/models.py`)

```python
from django.db import models
from django.conf import settings

class OperationRequest(models.Model):
    """
    Model for operational requests and tickets
    """
    TYPE_CHOICES = [
        ('technical', 'Technical'),
        ('security', 'Security'),
        ('administrative', 'Administrative'),
        ('maintenance', 'Maintenance'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_requests')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'operation_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"
```

### 5. Invoice Model (`financial/models.py`)

```python
from django.db import models
from django.conf import settings

class Invoice(models.Model):
    """
    Model for tenant invoices
    """
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
        ('overdue', 'Overdue'),
    ]
    
    invoice_number = models.CharField(max_length=50, unique=True)
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unpaid')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.tenant.username}"
```

### 6. Payment Model (`financial/models.py`)

```python
class Payment(models.Model):
    """
    Model for payment transactions
    """
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('check', 'Check'),
        ('cash', 'Cash'),
    ]
    
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]
    
    payment_id = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='completed')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"{self.payment_id} - ${self.amount}"
```

### 7. Commercial Unit Model (`commercial_spaces/models.py`)

```python
from django.db import models
from django.conf import settings

class CommercialUnit(models.Model):
    """
    Model for commercial space units
    """
    TYPE_CHOICES = [
        ('retail', 'Retail'),
        ('food', 'Food'),
        ('service', 'Service'),
        ('office', 'Office'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Under Maintenance'),
    ]
    
    unit_number = models.CharField(max_length=20, unique=True)
    floor = models.IntegerField()
    size = models.DecimalField(max_digits=8, decimal_places=2, help_text='Size in square meters')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    rental_rate = models.DecimalField(max_digits=10, decimal_places=2, help_text='Monthly rental rate')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='commercial_units')
    lease_start_date = models.DateField(null=True, blank=True)
    lease_end_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'commercial_units'
        ordering = ['floor', 'unit_number']
    
    def __str__(self):
        return f"Unit {self.unit_number} - Floor {self.floor}"
```

### 8. Maintenance Request Model (`maintenance/models.py`)

```python
from django.db import models
from django.conf import settings

class MaintenanceRequest(models.Model):
    """
    Model for tenant maintenance requests
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='maintenance_requests')
    unit_number = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_maintenance')
    
    attachment = models.FileField(upload_to='maintenance_attachments/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'maintenance_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.tenant.username}"
```

---

## API Endpoints

### Authentication Endpoints (`users/urls.py`)

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # JWT Authentication
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current_user'),
    
    # User Management
    path('users/', views.UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', views.UserRetrieveUpdateDestroyView.as_view(), name='user_detail'),
    path('users/bulk-import/', views.BulkUserImportView.as_view(), name='bulk_user_import'),
]
```

### Serializers Example (`users/serializers.py`)

```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'phone', 'avatar', 'department', 'unit_number', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
```

### Views Example (`users/views.py`)

```python
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import User
from .serializers import UserSerializer

class CurrentUserView(APIView):
    """
    Get current authenticated user details
    Frontend API Call: GET /api/auth/me/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListCreateView(generics.ListCreateAPIView):
    """
    List all users or create a new user
    Frontend API Call: GET /api/users/ or POST /api/users/
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role', None)
        search = self.request.query_params.get('search', None)
        
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(email__icontains=search)
            )
        return queryset

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user
    Frontend API Call: GET/PATCH/DELETE /api/users/{id}/
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
```

---

## CORS Configuration

Add to `settings.py`:

```python
# CORS Settings - Allow React frontend to access Django backend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React dev server
    "https://yourdomain.com",  # Production domain
]

# Or for development, allow all origins (NOT recommended for production)
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## File Upload Configuration

Add to `settings.py`:

```python
# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Allowed file extensions
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif']
```

In `urls.py` (main):

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your url patterns
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## Environment Variables

Create `.env` file:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=skymall_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_email_password
```

Use in `settings.py`:

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
```

---

## Migration Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 8000
```

---

## Testing API Endpoints

Use the provided API service in `/src/app/services/api.ts` which contains all frontend integration points with clear comments indicating:

- Endpoint URL
- Request method (GET, POST, PATCH, DELETE)
- Request body structure
- Expected response format

Each API function has a comment block like:

```typescript
// DJANGO BACKEND INTEGRATION POINT
// API Call: POST /api/users/
// Request body: { email, firstName, lastName, role, ... }
// Response: Created User object
```

---

## Complete URL Configuration Example

Main `urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include('users.urls')),
        path('compliance/', include('compliance.urls')),
        path('schedule/', include('schedule.urls')),
        path('operations/', include('operations.urls')),
        path('financial/', include('financial.urls')),
        path('commercial-spaces/', include('commercial_spaces.urls')),
        path('maintenance/', include('maintenance.urls')),
        path('notifications/', include('notifications.urls')),
    ])),
]
```

---

## Notes

1. All model fields use snake_case (Django convention)
2. All API responses use camelCase (configured in serializers)
3. File uploads use Django's FileField/ImageField with proper validation
4. All sensitive data is encrypted in transit (HTTPS in production)
5. JWT tokens expire after 5 hours (configurable)
6. All timestamps are in UTC
7. Pagination is set to 10 items per page (configurable)

---

For questions or issues, refer to the inline comments in `/src/app/services/api.ts` which contains all frontend-backend integration points.
