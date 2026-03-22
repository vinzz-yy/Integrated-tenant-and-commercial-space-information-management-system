from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    # Profile ng user
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=16, choices=[('admin','admin'),('staff','staff'),('tenant','tenant')])  # Role ng user
    avatar = models.URLField(blank=True, null=True)  # Profile picture URL
    phone = models.CharField(max_length=32, blank=True, null=True)  # Numero ng telepono
    department = models.CharField(max_length=64, blank=True, null=True)  # Department (para sa staff)
    unitNumber = models.CharField(max_length=32, blank=True, null=True)  # Unit number (para sa tenant)

    def to_dict(self):
        # I-convert sa dictionary para sa API response
        return {
            'id': str(self.user.id),
            'email': self.user.email,
            'firstName': self.user.first_name,
            'lastName': self.user.last_name,
            'role': self.role,
            'avatar': self.avatar,
            'phone': self.phone,
            'department': self.department,
            'unitNumber': self.unitNumber,
        }


class CommercialUnit(models.Model):
    # Commercial unit/model ng commercial space
    number = models.CharField(max_length=32)  # Unit number
    floor = models.IntegerField(default=1)  # Palapag
    type = models.CharField(max_length=32, default='retail')  # Uri ng unit
    status = models.CharField(max_length=16, choices=[('available','available'),('occupied','occupied'),('reserved','reserved'),('maintenance','maintenance')], default='available')  # Status
    tenant_name = models.CharField(max_length=128, blank=True, null=True)  # Pangalan ng tenant

    def to_dict(self):
        return {
            'id': str(self.id),
            'number': self.number,
            'floor': self.floor,
            'type': self.type,
            'status': self.status,
            'tenant_name': self.tenant_name,
        }


class Appointment(models.Model):
    # Appointment/schedule para sa meetings
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', blank=True, null=True)  # Tenant na kasali
    title = models.CharField(max_length=128)  # Pamagat ng appointment
    date = models.DateField()  # Petsa
    time = models.CharField(max_length=32)  # Oras
    location = models.CharField(max_length=128, blank=True, null=True)  # Lokasyon
    status = models.CharField(max_length=16, choices=[('scheduled','scheduled'),('in_progress','in_progress'),('completed','completed'),('cancelled','cancelled')], default='scheduled')  # Status

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'date': self.date.isoformat(),
            'time': self.time,
            'status': self.status,
        }


class ComplianceDocument(models.Model):
    # Compliance documents 
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compliance_documents', blank=True, null=True)
    status = models.CharField(max_length=16, choices=[('pending','pending'),('approved','approved'),('rejected','rejected')], default='pending')
    notes = models.TextField(blank=True, null=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant_id': self.tenant_id,
            'status': self.status,
            'notes': self.notes,
        }


class Payment(models.Model):
    # Payment ng tenant
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', blank=True, null=True) 
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  
    payment_method = models.CharField(max_length=32, default='cash')  
    description = models.TextField(blank=True, null=True)  
    status = models.CharField(max_length=16, choices=[('pending','pending'),('completed','completed'),('failed','failed')], default='completed')  
    payment_date = models.DateField(default=timezone.now)  
    created_at = models.DateTimeField(auto_now_add=True)  

    def to_dict(self):
        return {
            'id': str(self.id),
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'description': self.description,
            'status': self.status,
            'payment_date': self.payment_date.isoformat(),
            'created_at': self.created_at.isoformat(),
        }


class Notification(models.Model):
    # Notification para sa users
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True) 
    title = models.CharField(max_length=128) 
    message = models.TextField()  
    type = models.CharField(max_length=16, choices=[('success','success'),('warning','warning'),('info','info')], default='info')  
    read = models.BooleanField(default=False)  
    created_at = models.DateTimeField(auto_now_add=True)  

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'read': self.read,
            'created_at': self.created_at.isoformat(),
        }


class Document(models.Model):
    # Document management 
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')  
    document_type = models.CharField(max_length=64)  
    file = models.FileField(upload_to='documents/', blank=True, null=True) 
    status = models.CharField(max_length=16, choices=[('pending','pending'),('approved','approved'),('rejected','rejected')], default='pending') 
    notes = models.TextField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)  
    expiry_date = models.DateField(blank=True, null=True)  

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant': self.tenant.id,
            'document_type': self.document_type,
            'file': self.file.url if self.file else None,
            'status': self.status,
            'notes': self.notes,
            'upload_date': self.upload_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
        }


class Unit(models.Model):
    # Unit/property management
    number = models.CharField(max_length=32)  
    unit_number = models.CharField(max_length=32, blank=True, null=True) 
    type = models.CharField(max_length=32, default='residential')  
    floor = models.IntegerField(default=1)  
    size = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  
    rental_rate = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)  
    monthly_rent = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True) 
    status = models.CharField(max_length=16, choices=[('available','available'),('occupied','occupied'),('reserved','reserved'),('maintenance','maintenance')], default='available') 
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)  
    tenant = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='units')  
    tenant_name = models.CharField(max_length=128, blank=True, null=True)  
    lease_start_date = models.DateField(blank=True, null=True)  
    lease_end_date = models.DateField(blank=True, null=True)  
    amenities = models.TextField(blank=True, null=True)  
    image = models.ImageField(upload_to='units/', blank=True, null=True)  

    def to_dict(self):
        return {
            'id': str(self.id),
            'number': self.number,
            'unit_number': self.unit_number,
            'type': self.type,
            'floor': self.floor,
            'size': float(self.size) if self.size else None,
            'rental_rate': float(self.rental_rate) if self.rental_rate else None,
            'monthly_rent': float(self.monthly_rent) if self.monthly_rent else None,
            'status': self.status,
            'security_deposit': float(self.security_deposit) if self.security_deposit else None,
            'tenant': self.tenant.id if self.tenant else None,
            'tenant_name': self.tenant_name,
            'lease_start_date': self.lease_start_date.isoformat() if self.lease_start_date else None,
            'lease_end_date': self.lease_end_date.isoformat() if self.lease_end_date else None,
            'amenities': self.amenities,
            'image': self.image.url if self.image else None,
        }


class MaintenanceRequest(models.Model):
    # Maintenance request
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_requests')  
    title = models.CharField(max_length=128)
    description = models.TextField()  
    attachment = models.FileField(upload_to='maintenance/', blank=True, null=True) 
    request_type = models.CharField(max_length=32, default='Technical')  
    status = models.CharField(max_length=16, choices=[('pending','pending'),('in_progress','in_progress'),('completed','completed'),('cancelled','cancelled')], default='pending') 
    created_at = models.DateTimeField(auto_now_add=True)  

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant': self.tenant.id,
            'title': self.title,
            'description': self.description,
            'attachment': self.attachment.url if self.attachment else None,
            'type': self.request_type,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }