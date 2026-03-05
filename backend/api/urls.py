from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    LogoutView,
    MeView,
    UsersViewSet,
    DocumentsViewSet,
    AppointmentsViewSet,
    UnitsViewSet,
    MaintenanceRequestsViewSet,
    NotificationsViewSet,
    OperationsRequestsViewSet,
    OperationsMetricsView,
    ActivityLogsView,
    FinancialInvoicesViewSet,
    FinancialPaymentsViewSet,
    RevenueAnalyticsView,
    ProfitLossReportView,
    TasksView,
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r"users", UsersViewSet, basename="users")
router.register(r"compliance/documents", DocumentsViewSet, basename="documents")
router.register(r"schedule/appointments", AppointmentsViewSet, basename="appointments")
router.register(r"commercial-spaces/units", UnitsViewSet, basename="units")
router.register(r"maintenance/requests", MaintenanceRequestsViewSet, basename="maintenance-requests")
router.register(r"notifications", NotificationsViewSet, basename="notifications")
router.register(r"financial/invoices", FinancialInvoicesViewSet, basename="invoices")
router.register(r"financial/payments", FinancialPaymentsViewSet, basename="payments")
router.register(r"operations/requests", OperationsRequestsViewSet, basename="operations-requests")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("operations/activity-logs/", ActivityLogsView.as_view(), name="activity_logs"),
    path("operations/metrics/", OperationsMetricsView.as_view(), name="operations_metrics"),
    path("financial/revenue-analytics/", RevenueAnalyticsView.as_view(), name="revenue_analytics"),
    path("financial/reports/profit-loss/", ProfitLossReportView.as_view(), name="profit_loss"),
    path("schedule/tasks/", TasksView.as_view(), name="tasks"),
    path("", include(router.urls)),
]
