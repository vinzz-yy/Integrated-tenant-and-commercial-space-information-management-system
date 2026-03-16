from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, Document, Appointment, Unit, MaintenanceRequest, Notification, Payment, Invoice
from .serializers import (
    UserSerializer,
    DocumentSerializer,
    AppointmentSerializer,
    UnitSerializer,
    MaintenanceRequestSerializer,
    NotificationSerializer,
    PaymentSerializer,
    InvoiceSerializer,
)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": UserSerializer(user).data})

class LogoutView(APIView):
    def post(self, request):
        return Response({"detail": "Logged out"})

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def patch(self, request):
        user = request.user
        data = request.data or {}
        # Update basic user fields
        first_name = data.get("firstName") or data.get("first_name")
        last_name = data.get("lastName") or data.get("last_name")
        email = data.get("email")
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        # Optionally allow email change
        if email:
            user.email = email
        user.save()
        # Update profile fields
        profile = getattr(user, "profile", None)
        if profile:
            if "phone" in data:
                profile.phone = data.get("phone")
            if "department" in data:
                profile.department = data.get("department")
            if "avatar" in data:
                profile.avatar = data.get("avatar")
            if "unitNumber" in data:
                profile.unitNumber = data.get("unitNumber")
            profile.save()
        return Response(UserSerializer(user).data)

class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = getattr(self.request, "user", None)
        if not (getattr(user, "is_staff", False) or getattr(getattr(user, "profile", None), "role", "") == "admin"):
            return User.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        if not (getattr(request.user, "is_staff", False) or getattr(getattr(request.user, "profile", None), "role", "") == "admin"):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        # Support camelCase from frontend
        if "firstName" in data:
            data["first_name"] = data.pop("firstName")
        if "lastName" in data:
            data["last_name"] = data.pop("lastName")
        password = data.pop('password', None)
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        UserProfile.objects.create(
            user=user,
            role=data.get('role', 'staff'),
            phone=data.get('phone', ''),
            department=data.get('department', ''),
            unitNumber=data.get('unitNumber', '')
        )
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        if not (getattr(request.user, "is_staff", False) or getattr(getattr(request.user, "profile", None), "role", "") == "admin"):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        data = request.data.copy()
        # Support camelCase from frontend
        if "firstName" in data:
            data["first_name"] = data.pop("firstName")
        if "lastName" in data:
            data["last_name"] = data.pop("lastName")
        password = data.pop('password', None)
        if password:
            instance.set_password(password)
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if instance.profile:
            profile_data = {
                'role': data.get('role', instance.profile.role),
                'phone': data.get('phone', instance.profile.phone),
                'department': data.get('department', instance.profile.department),
                'unitNumber': data.get('unitNumber', instance.profile.unitNumber)
            }
            for key, value in profile_data.items():
                setattr(instance.profile, key, value)
            instance.profile.save()
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="bulk-import", permission_classes=[permissions.IsAdminUser], parser_classes=[MultiPartParser, FormParser])
    def bulk_import(self, request):
        # Placeholder: accept file and return success
        return Response({"detail": "Imported"}, status=200)

class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-upload_date")
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser,]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.profile.role == 'tenant':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.profile.role == 'tenant':
            data["tenant"] = request.user.id
        else:
            tid = data.pop("tenant_id", None)
            if tid:
                data["tenant"] = tid
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class AppointmentsViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by("date")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant' or role == 'staff':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.profile.role == 'tenant':
            data["tenant"] = request.user.id
        else:
            tid = data.pop("tenant_id", None)
            if tid:
                data["tenant"] = tid
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UnitsViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all().order_by("-id")
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
            return qs.filter(tenant=user)
        if getattr(user, "is_staff", False) or role in ('admin', 'staff'):
            return qs
        tenant_id = self.request.query_params.get("tenant_id")
        if tenant_id:
            return qs.filter(tenant_id=tenant_id)
        return Unit.objects.none()

    @action(detail=True, methods=["post"], url_path="assign-tenant")
    def assign_tenant(self, request, pk=None):
        unit = self.get_object()
        tenant_id = request.data.get("tenant_id")
        try:
            tenant = User.objects.get(pk=tenant_id)
        except User.DoesNotExist:
            return Response({"detail": "Tenant not found"}, status=404)
        unit.tenant = tenant
        unit.status = "occupied"
        unit.save()
        return Response(UnitSerializer(unit).data)

class MaintenanceRequestsViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.profile.role == 'tenant':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.profile.role == 'tenant':
            data["tenant"] = request.user.id
        else:
            tid = data.pop("tenant_id", None)
            if tid:
                data["tenant"] = tid
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class NotificationsViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        note = self.get_object()
        note.is_read = True
        note.save()
        return Response({"detail": "Marked read"})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All marked read"})

class OperationsRequestsViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == "tenant":
            return qs.filter(tenant=user)
        tenant_id = self.request.query_params.get("tenant_id")
        if tenant_id:
            return qs.filter(tenant_id=tenant_id)
        if getattr(user, "is_staff", False) or role == "admin":
            return qs
        return MaintenanceRequest.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user = request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == "tenant":
            data["tenant"] = user.id
        else:
            tid = data.pop("tenant_id", None)
            data["tenant"] = tid or user.id
        if "status" not in data:
            data["status"] = "pending"
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        tid = data.pop("tenant_id", None)
        if tid:
            data["tenant"] = tid
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="set-status")
    def set_status(self, request, pk=None):
        instance = self.get_object()
        status_value = request.data.get("status")
        if status_value not in {"pending", "in_progress", "completed", "cancelled"}:
            return Response({"detail": "Invalid status"}, status=400)
        instance.status = status_value
        instance.save()
        return Response(self.get_serializer(instance).data)

class OperationsMetricsView(APIView):
    def get(self, request):
        return Response({"requests_open": MaintenanceRequest.objects.filter(status="open").count()})

class ActivityLogsView(APIView):
    def get(self, request):
        return Response({"logs": []})

class FinancialInvoicesViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by("-created_at")
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.profile.role == 'tenant':
            qs = qs.filter(user=user)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.profile.role == 'tenant':
            data["user"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class FinancialPaymentsViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.profile.role == 'tenant':
            qs = qs.filter(user=user)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if request.user.profile.role == 'tenant':
            data["user"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    permission_classes = [permissions.IsAuthenticated]

class RevenueAnalyticsView(APIView):
    def get(self, request):
        return Response({"monthly": []})

class ProfitLossReportView(APIView):
    def get(self, request):
        return Response({"profit": 0, "loss": 0})

class TasksView(APIView):
    def get(self, request):
        return Response({"results": []})
