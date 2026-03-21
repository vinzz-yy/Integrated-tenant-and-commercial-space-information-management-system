from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LogoutView, MeView, UsersViewSet, DocumentsViewSet,
    AppointmentsViewSet, UnitsViewSet, MaintenanceRequestsViewSet,
    NotificationsViewSet, OperationsRequestsViewSet, FinancialPaymentsViewSet,
)
from rest_framework_simplejwt.views import TokenRefreshView

# Router para sa mga ViewSet
router = DefaultRouter()
# I-register ang mga ViewSet sa router
router.register(r"users", UsersViewSet, basename="users")  
router.register(r"compliance/documents", DocumentsViewSet, basename="documents")  
router.register(r"schedule/appointments", AppointmentsViewSet, basename="appointments")  
router.register(r"commercial-spaces/units", UnitsViewSet, basename="units") 
router.register(r"maintenance/requests", MaintenanceRequestsViewSet, basename="maintenance-requests") 
router.register(r"notifications", NotificationsViewSet, basename="notifications")  
router.register(r"financial/payments", FinancialPaymentsViewSet, basename="payments")  
router.register(r"operations/requests", OperationsRequestsViewSet, basename="operations-requests")  

urlpatterns = [
    # Authentication endpoints
    path("auth/login/", LoginView.as_view(), name="login"),  
    path("auth/logout/", LogoutView.as_view(), name="logout"),  
    path("auth/me/", MeView.as_view(), name="me"),  
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  
    
    # Isama ang router URLs
    path("", include(router.urls)),
]