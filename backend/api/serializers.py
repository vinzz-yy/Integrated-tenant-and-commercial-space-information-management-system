from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, Appointment, Unit, MaintenanceRequest, Notification, Payment, Invoice

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    avatar = serializers.URLField(source='profile.avatar', read_only=True)
    phone = serializers.CharField(source='profile.phone', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    unitNumber = serializers.CharField(source='profile.unitNumber', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "avatar", "phone", "department", "unitNumber", "password"]

class DocumentSerializer(serializers.ModelSerializer):
    documentType = serializers.CharField(source="document_type", read_only=True)
    fileName = serializers.SerializerMethodField()
    uploadDate = serializers.DateField(source="upload_date", read_only=True)
    expiryDate = serializers.DateField(source="expiry_date", required=False)

    def get_fileName(self, obj):
        return obj.file.name.split("/")[-1] if obj.file else ""

    class Meta:
        model = Document
        fields = ["id", "tenant", "document_type", "documentType", "file", "fileName", "status", "notes", "upload_date", "uploadDate", "expiry_date", "expiryDate"]
        extra_kwargs = {"tenant": {"write_only": True}}

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "tenant", "title", "date", "time", "location", "status"]
        extra_kwargs = {"tenant": {"write_only": True}}

class UnitSerializer(serializers.ModelSerializer):
    unitNumber = serializers.CharField(source="unit_number", required=False)
    monthlyRent = serializers.DecimalField(source="monthly_rent", max_digits=12, decimal_places=2, required=False)
    rentalRate = serializers.DecimalField(source="rental_rate", max_digits=12, decimal_places=2, required=False)
    securityDeposit = serializers.DecimalField(source="security_deposit", max_digits=12, decimal_places=2, required=False)
    leaseStartDate = serializers.DateField(source="lease_start_date", required=False)
    leaseEndDate = serializers.DateField(source="lease_end_date", required=False)

    class Meta:
        model = Unit
        fields = ["id", "number", "unit_number", "unitNumber", "type", "floor", "size", "rental_rate", "rentalRate", "monthly_rent", "monthlyRent", "status", "security_deposit", "securityDeposit", "tenant", "lease_start_date", "leaseStartDate", "lease_end_date", "leaseEndDate", "amenities"]

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ["id", "tenant", "title", "description", "attachment", "status", "created_at"]
        extra_kwargs = {"tenant": {"write_only": True}}

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "created_at", "read"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "amount", "created_at"]

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["id", "user", "amount", "status", "due_date", "created_at"]
        extra_kwargs = {"user": {"write_only": True}}
