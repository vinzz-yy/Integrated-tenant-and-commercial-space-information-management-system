from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, Appointment, Unit, MaintenanceRequest, Notification, Payment

class UserSerializer(serializers.ModelSerializer):
    # Kunin ang fields mula sa UserProfile model
    role = serializers.CharField(source='profile.role', read_only=True)
    avatar = serializers.URLField(source='profile.avatar', read_only=True)
    phone = serializers.CharField(source='profile.phone', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    unitNumber = serializers.CharField(source='profile.unitNumber', read_only=True)
    # Password ay write-only para hindi ma-expose 
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "avatar", "phone", "department", "unitNumber", "password"]


class DocumentSerializer(serializers.ModelSerializer):
    # Custom fields para sa frontend compatibility
    tenantName = serializers.SerializerMethodField()
    documentType = serializers.CharField(source="document_type", read_only=True)
    fileName = serializers.SerializerMethodField()
    uploadDate = serializers.DateField(source="upload_date", read_only=True)
    expiryDate = serializers.DateField(source="expiry_date", required=False)

    def get_fileName(self, obj):
        # Kunin ang filename mula sa file path
        return obj.file.name.split("/")[-1] if obj.file else ""
    
    def get_tenantName(self, obj):
        # Kunin ang pangalan ng tenant
        try:
            first = obj.tenant.first_name or ""
            last = obj.tenant.last_name or ""
            name = (first + " " + last).strip()
            return name or obj.tenant.email
        except Exception:
            return ""

    class Meta:
        model = Document
        fields = ["id", "tenant", "tenantName", "document_type", "documentType", "file", "fileName", "status", "notes", "upload_date", "uploadDate", "expiry_date", "expiryDate"]
        extra_kwargs = {"tenant": {"write_only": True}}  # Tenant ay write-only


class AppointmentSerializer(serializers.ModelSerializer):
    # Custom fields
    assignedTo = serializers.SerializerMethodField()
    tenantId = serializers.IntegerField(source="tenant_id", read_only=True)

    def get_assignedTo(self, obj):
        # Kunin ang pangalan ng assigned tenant
        try:
            u = obj.tenant
            if not u:
                return "Unassigned"
            name = f"{u.first_name or ''} {u.last_name or ''}".strip()
            return name or u.email
        except Exception:
            return "Unassigned"

    class Meta:
        model = Appointment
        fields = ["id", "tenant", "tenantId", "assignedTo", "title", "date", "time", "location", "status"]
        extra_kwargs = {"tenant": {"write_only": True, "required": False, "allow_null": True}}


class UnitSerializer(serializers.ModelSerializer):
    # I-map ang camelCase fields 
    unitNumber = serializers.CharField(source="unit_number", required=False)
    monthlyRent = serializers.DecimalField(source="monthly_rent", max_digits=12, decimal_places=2, required=False)
    rentalRate = serializers.DecimalField(source="rental_rate", max_digits=12, decimal_places=2, required=False)
    securityDeposit = serializers.DecimalField(source="security_deposit", max_digits=12, decimal_places=2, required=False)
    leaseStartDate = serializers.DateField(source="lease_start_date", required=False)
    leaseEndDate = serializers.DateField(source="lease_end_date", required=False)
    image = serializers.ImageField(required=False, allow_null=True)
    tenantName = serializers.CharField(source="tenant_name", required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Unit
        fields = ["id", "number", "unit_number", "unitNumber", "type", "floor", "size", "rental_rate", "rentalRate", "monthly_rent", "monthlyRent", "status", "security_deposit", "securityDeposit", "tenant", "tenant_name", "tenantName", "lease_start_date", "leaseStartDate", "lease_end_date", "leaseEndDate", "amenities", "image"]


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    # Custom fields
    assignedTo = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    type = serializers.CharField(source="request_type", required=False)
    
    class Meta:
        model = MaintenanceRequest
        fields = ["id", "tenant", "assignedTo", "title", "description", "attachment", "type", "status", "created_at", "createdAt"]
        extra_kwargs = {"tenant": {"write_only": True}}
    
    def get_assignedTo(self, obj):
        # Kunin ang pangalan ng tenant na nag-request
        try:
            u = obj.tenant
            if not u:
                return "Unassigned"
            name = f"{u.first_name or ''} {u.last_name or ''}".strip()
            return name or u.email
        except Exception:
            return "Unassigned"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "created_at", "read"]


class PaymentSerializer(serializers.ModelSerializer):
    # Custom fields para sa payment info
    tenant_name = serializers.SerializerMethodField()
    tenant_id = serializers.IntegerField(source='user.id', read_only=True)

    def get_tenant_name(self, obj):
        # Kunin ang pangalan ng tenant na nagbayad
        try:
            user = obj.user
            if not user:
                return "Unassigned"
            name = f"{user.first_name or ''} {user.last_name or ''}".strip()
            return name or user.email
        except Exception:
            return "Unassigned"

    class Meta:
        model = Payment
        fields = ["id", "amount", "payment_method", "description", "status", "payment_date", "created_at", "tenant_name", "tenant_id", "user"]
        extra_kwargs = {"user": {"required": False, "allow_null": True}}  # User ay optional