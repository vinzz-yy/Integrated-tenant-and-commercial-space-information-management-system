from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    UserProfile, Appointment, Payment,
    Notification, Document, Unit, MaintenanceRequest,
)

# Admin site branding
admin.site.site_header = "Integrated Tenant and Commercial Space Management"
admin.site.site_title = "Integrated Tenant and Commercial Space Management Admin Portal"
admin.site.index_title = "Welcome to Skymall Administration"
admin.site.site_url = 'http://localhost:5173/login'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ('get_full_name', 'get_email', 'role', 'phone', 'unitNumber', 'department')
    list_filter   = ('role',)
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'phone', 'unitNumber')
    readonly_fields = ('user',)

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    get_full_name.short_description = 'Full Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display  = ('number', 'type', 'floor', 'status', 'tenant_name', 'monthly_rent', 'lease_start_date', 'lease_end_date')
    list_filter   = ('status', 'type', 'floor')
    search_fields = ('number', 'unit_number', 'tenant_name')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display  = ('title', 'get_tenant', 'date', 'time', 'location', 'status')
    list_filter   = ('status', 'date')
    search_fields = ('title', 'tenant__first_name', 'tenant__last_name', 'location')
    readonly_fields = ('tenant',)

    def get_tenant(self, obj):
        return obj.tenant.get_full_name() if obj.tenant else '—'
    get_tenant.short_description = 'Tenant'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ('document_type', 'get_tenant', 'status', 'upload_date', 'expiry_date')
    list_filter   = ('status', 'document_type')
    search_fields = ('document_type', 'tenant__first_name', 'tenant__last_name')
    readonly_fields = ('upload_date',)

    def get_tenant(self, obj):
        return obj.tenant.get_full_name()
    get_tenant.short_description = 'Tenant'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('get_user', 'amount', 'payment_method', 'status', 'payment_date', 'created_at')
    list_filter   = ('status', 'payment_method', 'payment_date')
    search_fields = ('user__first_name', 'user__last_name', 'description')
    readonly_fields = ('created_at',)

    def get_user(self, obj):
        return obj.user.get_full_name() if obj.user else '—'
    get_user.short_description = 'Tenant'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ('title', 'get_user', 'type', 'read', 'created_at')
    list_filter   = ('type', 'read')
    search_fields = ('title', 'message', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at',)

    def get_user(self, obj):
        return obj.user.get_full_name() if obj.user else '—'
    get_user.short_description = 'User'


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display  = ('title', 'get_tenant', 'request_type', 'status', 'created_at')
    list_filter   = ('status', 'request_type')
    search_fields = ('title', 'description', 'tenant__first_name', 'tenant__last_name')
    readonly_fields = ('created_at',)

    def get_tenant(self, obj):
        return obj.tenant.get_full_name()
    get_tenant.short_description = 'Tenant'
