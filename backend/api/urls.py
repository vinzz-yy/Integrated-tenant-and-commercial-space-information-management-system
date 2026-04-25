from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, MeView,
    UsersViewSet, DocumentsViewSet, EventsViewSet,
    UnitsViewSet, MaintenanceRequestsViewSet,
    NotificationsViewSet, ComplianceRequestsViewSet, FinancialPaymentsViewSet,
    ArchivesViewSet,
)

# Router para sa mga ViewSet
router = DefaultRouter()

# I-register ang mga ViewSet sa router
router.register(r"users",UsersViewSet,basename="users")
router.register(r"documents",DocumentsViewSet,basename="documents")
router.register(r"events",EventsViewSet,basename="events")
router.register(r"commercial-spaces/units",UnitsViewSet,basename="units")
router.register(r"maintenance/requests",MaintenanceRequestsViewSet,basename="maintenance-requests")
router.register(r"notifications",NotificationsViewSet,basename="notifications")
router.register(r"financial/payments",FinancialPaymentsViewSet,basename="payments")
router.register(r"compliance/requests",ComplianceRequestsViewSet,basename="compliance-requests")
router.register(r"archives",ArchivesViewSet,basename="archives")

urlpatterns = [

    # Authentication endpoints
    path("auth/login/",LoginView.as_view(),name="login"),
    path("auth/logout/",LogoutView.as_view(),name="logout"),
    path("auth/me/",MeView.as_view(),name="me"),
    path("auth/refresh/",TokenRefreshView.as_view(),name="token_refresh"),

    # Isama ang router URLs (kasama na ang lahat ng ViewSet routes + custom actions)
    path("", include(router.urls)),
]
