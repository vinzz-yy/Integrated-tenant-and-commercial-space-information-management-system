from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, Document, Appointment, Unit, MaintenanceRequest, Notification, Payment
from .serializers import (UserSerializer,DocumentSerializer,AppointmentSerializer,UnitSerializer,MaintenanceRequestSerializer,NotificationSerializer,PaymentSerializer,)

# AUTH

class LoginView(APIView):
    # Login - return JWT tokens
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": UserSerializer(user).data})


class LogoutView(APIView):
    # Logout - tanggalin tokens sa frontend
    def post(self, request):
        return Response({"detail": "Logged out"})


class MeView(APIView):
    # Kunin o i-update ang sariling profile
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def patch(self, request):
        user = request.user
        data = request.data or {}
        
        # Update user fields
        first_name = data.get("firstName") or data.get("first_name")
        last_name = data.get("lastName") or data.get("last_name")
        email = data.get("email")
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
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
            if "leaseStartDate" in data:
                profile.lease_start_date = data.get("leaseStartDate")
            if "leaseEndDate" in data:
                profile.lease_end_date = data.get("leaseEndDate")
            profile.save()
        return Response(UserSerializer(user).data)


#USERS 

class UsersViewSet(viewsets.ModelViewSet):
    # User management - admin/staff lang pwede
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # I-filter ang users based sa role
        user = getattr(self.request, "user", None)
        if not (getattr(user, "is_staff", False) or getattr(getattr(user, "profile", None), "role", "") in ["admin", "staff"]):
            return User.objects.none()
            
        qs = super().get_queryset()
        
        # Parameter filters
        role_param = self.request.query_params.get("role")
        if role_param:
            qs = qs.filter(profile__role=role_param)
            
        search_param = self.request.query_params.get("search")
        if search_param:
            from django.db.models import Q
            qs = qs.filter(
                Q(first_name__icontains=search_param) |
                Q(last_name__icontains=search_param) |
                Q(username__icontains=search_param) |
                Q(email__icontains=search_param) |
                Q(id__icontains=search_param)
            )
            
        return qs

    def create(self, request, *args, **kwargs):
        # Gumawa ng bagong user
        user_role = getattr(getattr(request.user, "profile", None), "role", "")
        target_role = request.data.get('role', 'staff')
        
        is_admin = getattr(request.user, "is_staff", False) or user_role == "admin"
        is_staff_creating_tenant = user_role == "staff" and target_role == "tenant"
        
        if not (is_admin or is_staff_creating_tenant):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        
        # Convert frontend fields to backend fields if necessary
        if "firstName" in data: data["first_name"] = data.pop("firstName")
        if "lastName" in data: data["last_name"] = data.pop("lastName")
        
        # Ensure lease dates are correctly mapped for UserProfile
        lease_start = data.get('lease_start_date') or data.get('leaseStartDate')
        lease_end = data.get('lease_end_date') or data.get('leaseEndDate')
        
        password = data.pop('password', None)
        email = data.get('email')
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        
        role = data.get('role', 'staff')
        unit_number = data.get('unitNumber', '')
        
        UserProfile.objects.create(
            user=user,
            role=role,
            phone=data.get('phone', ''),
            department=data.get('department', ''),
            unitNumber=unit_number,
            lease_start_date=lease_start,
            lease_end_date=lease_end
        )
        
        # Automatic unit assignment logic
        if role == 'tenant' and unit_number:
            from .models import Unit
            from django.db.models import Q
            try:
                unit = Unit.objects.filter(Q(number=unit_number) | Q(unit_number=unit_number)).first()
                if unit:
                    unit.tenant = user
                    unit.tenant_name = f"{user.first_name} {user.last_name}".strip() or user.username
                    unit.status = 'occupied'
                    unit.save()
            except Exception:
                pass

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # I-update ang user details
        instance = self.get_object()
        user_role = getattr(getattr(request.user, "profile", None), "role", "")
        is_admin = getattr(request.user, "is_staff", False) or user_role == "admin"
        
        target_role = getattr(instance.profile, "role", "") if instance.profile else ""
        requested_new_role = request.data.get('role', target_role)
        
        is_staff_editing_tenant = user_role == "staff" and target_role == "tenant" and requested_new_role == "tenant"
        
        if not (is_admin or is_staff_editing_tenant):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data.copy()
        
        # Map frontend camelCase to snake_case for the User model
        if "firstName" in data: data["first_name"] = data.get("firstName")
        if "lastName" in data: data["last_name"] = data.get("lastName")
        
        # Use serializer for updating
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Re-fetch the instance to ensure we have the latest data for the response
        instance.refresh_from_db()
        if instance.profile:
            instance.profile.refresh_from_db()
            
        return Response(self.get_serializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_role = getattr(getattr(request.user, "profile", None), "role", "")
        is_admin = getattr(request.user, "is_staff", False) or user_role == "admin"
        
        target_role = getattr(instance.profile, "role", "") if instance.profile else ""
        is_staff_deleting_tenant = user_role == "staff" and target_role == "tenant"
        
        if not (is_admin or is_staff_deleting_tenant):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="bulk-import", permission_classes=[permissions.IsAdminUser], parser_classes=[MultiPartParser, FormParser])
    def bulk_import(self, request):
        # Bulk import ng users via file
        return Response({"detail": "Imported"}, status=200)


# DOCUMENTS 

class DocumentsViewSet(viewsets.ModelViewSet):
    # Document management - tenants sariling docs lang makikita
    queryset = Document.objects.all().order_by("-upload_date")
    serializer_class = DocumentSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # I-filter ang documents base sa role
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        # Mag-upload ng document
        user = getattr(request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        
        # Only tenants can upload documents
        if role != 'tenant':
            return Response({"detail": "Forbidden: Only tenants can upload documents."}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data.copy()
        data["tenant"] = user.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# APPOINTMENTS 

class EventsViewSet(viewsets.ModelViewSet):
    # Appointment/schedule management
    queryset = Appointment.objects.all().order_by("date")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # I-filter ang appointments base sa role
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        # Gumawa ng bagong appointment
        data = request.data.copy()
        user = getattr(request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
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

    def update(self, request, *args, **kwargs):
        # I-update ang appointment
        instance = self.get_object()
        data = request.data.copy()
        user = getattr(request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role != 'tenant':
            has_tid = "tenant_id" in data
            tid = data.pop("tenant_id", None)
            if has_tid:
                data["tenant"] = tid or None
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


# UNITS 

class UnitsViewSet(viewsets.ModelViewSet):
    # Unit/property management
    queryset = Unit.objects.all().order_by("-id")
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        # I-filter ang units base sa role
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
        # I-assign ang tenant sa unit
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


# MAINTENANCE 

class MaintenanceRequestsViewSet(viewsets.ModelViewSet):
    # Maintenance request management
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # I-filter ang requests base sa role
        qs = super().get_queryset()
        user = getattr(self.request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
            qs = qs.filter(tenant=user)
        else:
            tenant_id = self.request.query_params.get("tenant_id")
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
        return qs
    
    def create(self, request, *args, **kwargs):
        # Mag-report ng maintenance issue
        data = request.data.copy()
        user = getattr(request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == 'tenant':
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


# NOTIFICATIONS 

class NotificationsViewSet(viewsets.ModelViewSet):
    # Notification management
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Kunin lang ang notifications ng current user
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        # Mark as read ang isang notification
        note = self.get_object()
        note.read = True  # field name is 'read' (not 'is_read')
        note.save()
        return Response({"detail": "Marked read"})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        # Mark as read lahat ng notifications
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"detail": "All marked read"})


# OPERATIONS 

class ComplianceRequestsViewSet(viewsets.ModelViewSet):
    # Operations requests - maintenance requests para sa staff
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


# FINANCIAL 

class FinancialPaymentsViewSet(viewsets.ModelViewSet):
    # Payment/financial management
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get base queryset directly from model to avoid any caching issues
        qs = Payment.objects.all().order_by("-created_at")
        
        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return qs.none()
            
        role = getattr(getattr(user, "profile", None), "role", "")
        if role == 'tenant':
            return qs.filter(user=user)
        return qs

    def create(self, request, *args, **kwargs):
        # Admin or staff only for creating payments manually
        user_role = getattr(getattr(request.user, "profile", None), "role", "")
        is_staff_or_admin = request.user.is_staff or user_role in ['admin', 'staff']
        
        if not is_staff_or_admin:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data.copy()
        # Ensure user ID is an integer if provided as string
        if 'user' in data and data['user']:
            try:
                data['user'] = int(data['user'])
            except (ValueError, TypeError):
                pass

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Re-fetch the saved object to ensure all fields (like tenant_name) are populated
        instance = serializer.instance
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        # Only admin and staff can delete payments
        user_role = getattr(getattr(request.user, "profile", None), "role", "")
        is_staff_or_admin = request.user.is_staff or user_role in ['admin', 'staff']
        
        if not is_staff_or_admin:
            return Response({"detail": "Forbidden: Only admin and staff can delete payment records."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({"detail": f"Delete failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"], url_path="revenue-analytics")
    def revenue_analytics(self, request):
        # Simple revenue analytics
        from django.db.models import Sum
        from django.utils import timezone
        import datetime

        # Get total revenue
        total_revenue = Payment.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Get monthly revenue (last 6 months)
        monthly_revenue = []
        today = timezone.now().date()
        for i in range(5, -1, -1):
            # Calculate months correctly
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1
            
            month_date = datetime.date(year, month, 1)
            month_name = month_date.strftime('%b')
            amount = Payment.objects.filter(
                status='completed',
                payment_date__year=year,
                payment_date__month=month
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            monthly_revenue.append({'month': month_name, 'revenue': float(amount)})

        return Response({
            "total_revenue": float(total_revenue),
            "data": monthly_revenue
        })
