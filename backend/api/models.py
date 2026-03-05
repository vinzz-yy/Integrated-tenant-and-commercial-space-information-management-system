from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=16, choices=[('admin','admin'),('staff','staff'),('tenant','tenant')])
    avatar = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    department = models.CharField(max_length=64, blank=True, null=True)
    unitNumber = models.CharField(max_length=32, blank=True, null=True)

    def to_dict(self):
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
    number = models.CharField(max_length=32)
    floor = models.IntegerField(default=1)
    type = models.CharField(max_length=32, default='retail')
    status = models.CharField(max_length=16, choices=[('available','available'),('occupied','occupied'),('reserved','reserved'),('maintenance','maintenance')], default='available')
    tenant_name = models.CharField(max_length=128, blank=True, null=True)

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
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', blank=True, null=True)
    title = models.CharField(max_length=128)
    date = models.DateField()
    time = models.CharField(max_length=32)
    location = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=16, choices=[('scheduled','scheduled'),('completed','completed'),('cancelled','cancelled')], default='scheduled')

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'date': self.date.isoformat(),
            'time': self.time,
            'status': self.status,
        }

class ComplianceDocument(models.Model):
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'amount': float(self.amount),
            'created_at': self.created_at.isoformat(),
        }

class Invoice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices', blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=16, choices=[('unpaid','unpaid'),('paid','paid'),('overdue','overdue')], default='unpaid')
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'amount': float(self.amount),
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
        }

class Notification(models.Model):
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
    lease_start_date = models.DateField(blank=True, null=True)
    lease_end_date = models.DateField(blank=True, null=True)
    amenities = models.TextField(blank=True, null=True)

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
            'lease_start_date': self.lease_start_date.isoformat() if self.lease_start_date else None,
            'lease_end_date': self.lease_end_date.isoformat() if self.lease_end_date else None,
            'amenities': self.amenities,
        }

class MaintenanceRequest(models.Model):
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_requests')
    title = models.CharField(max_length=128)
    description = models.TextField()
    attachment = models.FileField(upload_to='maintenance/', blank=True, null=True)
    status = models.CharField(max_length=16, choices=[('pending','pending'),('in_progress','in_progress'),('completed','completed'),('cancelled','cancelled')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant': self.tenant.id,
            'title': self.title,
            'description': self.description,
            'attachment': self.attachment.url if self.attachment else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
