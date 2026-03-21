from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (UserProfile,CommercialUnit,Appointment,ComplianceDocument,Payment,Notification,Document,Unit,)

admin.site.site_header = "Integrated Tenant and Commercial Space Management "
admin.site.site_title = "Integrated Tenant and Commercial Space Management Admin Portal"
admin.site.index_title = "Welcome to Skymall Administration"
admin.site.site_url = 'http://localhost:5173/login'

admin.site.register(UserProfile)
admin.site.register(CommercialUnit)
admin.site.register(Unit)
admin.site.register(Appointment)
admin.site.register(ComplianceDocument)
admin.site.register(Document)
admin.site.register(Payment)
admin.site.register(Notification)

# To customize the default User admin, you can uncomment and modify this:
# from django.contrib.auth.models import User
# class CustomUserAdmin(UserAdmin):
#     list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
#     search_fields = ('username', 'email', 'first_name', 'last_name')
# admin.site.unregister(User)
# admin.site.register(User, CustomUserAdmin)
