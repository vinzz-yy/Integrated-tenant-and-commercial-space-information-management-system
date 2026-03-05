from django.contrib import admin

# Customize admin site appearance
admin.site.site_header = "Skymall Backend"
admin.site.site_title = "Skymall Admin Portal"
admin.site.index_title = "Welcome to Skymall Administration"
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, CommercialUnit, Appointment, ComplianceDocument, Payment, Notification

# Don't try to register the User model if it's the default one
# admin.site.register(User)  # Comment this out or remove it

admin.site.register(UserProfile)
admin.site.register(CommercialUnit)
admin.site.register(Appointment)
admin.site.register(ComplianceDocument)
admin.site.register(Payment)
admin.site.register(Notification)

# If you want to customize the User admin, you can uncomment and modify this:
# class CustomUserAdmin(UserAdmin):
#     list_display = ('email', 'first_name', 'last_name', 'is_staff')
#     search_fields = ('email', 'first_name', 'last_name')
# 
# admin.site.unregister(User)  # First unregister the default
# admin.site.register(User, CustomUserAdmin)  # Then register with custom admin