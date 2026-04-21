from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, MeView,
    UsersViewSet, DocumentsViewSet, EventsViewSet,
    UnitsViewSet, MaintenanceRequestsViewSet, NotificationsViewSet,
    ComplianceRequestsViewSet, FinancialPaymentsViewSet,
)

urlpatterns = [

    # AUTH
    path("auth/login/",   LoginView.as_view(),          name="login"),
    path("auth/logout/",  LogoutView.as_view(),         name="logout"),
    path("auth/me/",      MeView.as_view(),             name="me"),
    path("auth/refresh/", TokenRefreshView.as_view(),   name="token_refresh"),

    # USERS 
    path("users/",                  UsersViewSet.as_view({"get": "list",     "post": "create"}),          name="users-list"),
    path("users/<int:pk>/",         UsersViewSet.as_view({"get": "retrieve", "patch": "partial_update",  "delete": "destroy"}), name="users-detail"),
    path("users/bulk-import/",      UsersViewSet.as_view({"post": "bulk_import"}),                        name="users-bulk-import"),

    # DOCUMENTS 
    path("documents/",              DocumentsViewSet.as_view({"get": "list",     "post": "create"}),      name="documents-list"),
    path("documents/<int:pk>/",     DocumentsViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="documents-detail"),

    # EVENTS / APPOINTMENTS 
    path("events/",                 EventsViewSet.as_view({"get": "list",     "post": "create"}),         name="events-list"),
    path("events/<int:pk>/",        EventsViewSet.as_view({"get": "retrieve", "patch": "partial_update",  "delete": "destroy"}), name="events-detail"),

    # COMMERCIAL SPACES / UNITS 
    path("commercial-spaces/units/",                        UnitsViewSet.as_view({"get": "list",     "post": "create"}),         name="units-list"),
    path("commercial-spaces/units/<int:pk>/",               UnitsViewSet.as_view({"get": "retrieve", "patch": "partial_update",  "delete": "destroy"}), name="units-detail"),
    path("commercial-spaces/units/<int:pk>/assign-tenant/", UnitsViewSet.as_view({"post": "assign_tenant"}),                     name="units-assign-tenant"),

    # MAINTENANCE REQUESTS 
    path("maintenance/requests/",           MaintenanceRequestsViewSet.as_view({"get": "list",     "post": "create"}),          name="maintenance-list"),
    path("maintenance/requests/<int:pk>/",  MaintenanceRequestsViewSet.as_view({"get": "retrieve", "patch": "partial_update",   "delete": "destroy"}), name="maintenance-detail"),

    # NOTIFICATIONS 
    path("notifications/",                     NotificationsViewSet.as_view({"get": "list",     "post": "create"}),             name="notifications-list"),
    path("notifications/<int:pk>/",            NotificationsViewSet.as_view({"get": "retrieve", "patch": "partial_update",      "delete": "destroy"}), name="notifications-detail"),
    path("notifications/<int:pk>/mark-read/",  NotificationsViewSet.as_view({"patch": "mark_read"}),                            name="notifications-mark-read"),
    path("notifications/mark-all-read/",       NotificationsViewSet.as_view({"post": "mark_all_read"}),                         name="notifications-mark-all-read"),

    # FINANCIAL / PAYMENTS 
    path("financial/payments/",                       FinancialPaymentsViewSet.as_view({"get": "list",     "post": "create"}),  name="payments-list"),
    path("financial/payments/<int:pk>/",              FinancialPaymentsViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="payments-detail"),
    path("financial/payments/revenue-analytics/",     FinancialPaymentsViewSet.as_view({"get": "revenue_analytics"}),           name="payments-revenue-analytics"),

    # COMPLIANCE / OPERATIONS 
    path("compliance/requests/",           ComplianceRequestsViewSet.as_view({"get": "list",     "post": "create"}),           name="compliance-list"),
    path("compliance/requests/<int:pk>/",  ComplianceRequestsViewSet.as_view({"get": "retrieve", "patch": "partial_update",    "delete": "destroy"}), name="compliance-detail"),

]