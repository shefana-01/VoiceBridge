from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Child
from .serializers import (
    CaregiverRegisterSerializer,
    CaregiverSerializer,
    ChildSerializer,
)

Caregiver = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = Caregiver.objects.all()
    serializer_class = CaregiverRegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login endpoint with brute-force protection (5 attempts/min)."""
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"


class LogoutView(generics.GenericAPIView):
    """Blacklist the refresh token so it cannot be reused after logout."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            RefreshToken(request.data["refresh"]).blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(
                {"detail": "Invalid or missing refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH the logged-in caregiver's own profile."""
    serializer_class = CaregiverSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChildViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Child profiles, scoped to the logged-in caregiver.
    A caregiver can only see and edit their own children.
    """
    serializer_class = ChildSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Child.objects.filter(caregiver=self.request.user)

    def perform_create(self, serializer):
        serializer.save(caregiver=self.request.user)

from .models import CareNote
from .serializers import CareNoteSerializer

class CareNoteViewSet(viewsets.ModelViewSet):
    serializer_class = CareNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Owner-scoped: a caregiver only ever sees their own notes.
        return CareNote.objects.filter(caregiver=self.request.user)

    def perform_create(self, serializer):
        serializer.save(caregiver=self.request.user)

import pyotp
import qrcode
import io
import base64
from rest_framework.views import APIView

class MfaSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.mfa_secret:
            user.mfa_secret = pyotp.random_base32()
            user.save()
        
        totp = pyotp.TOTP(user.mfa_secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name="VoiceBridge")
        
        qr = qrcode.make(uri)
        buf = io.BytesIO()
        qr.save(buf, format='PNG')
        qr_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return Response({"qr_code": qr_b64, "secret": user.mfa_secret})

class MfaVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        if not code or not user.mfa_secret:
            return Response({"error": "Code or secret missing."}, status=status.HTTP_400_BAD_REQUEST)
        
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(code):
            user.mfa_enabled = True
            user.save()
            return Response({"success": "MFA enabled."})
        return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

class MfaLoginVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        code = request.data.get('code')
        
        try:
            user = Caregiver.objects.get(username=username)
        except Caregiver.DoesNotExist:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.check_password(password):
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if user.mfa_enabled:
            if not code:
                return Response({"mfa_required": True}, status=status.HTTP_403_FORBIDDEN)
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(code):
                return Response({"error": "Invalid MFA code."}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
