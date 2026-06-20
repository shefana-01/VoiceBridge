# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    ThrottledTokenObtainPairView,
    LogoutView,
    MeView,
    ChildViewSet,
    CareNoteViewSet,
    MfaSetupView,
    MfaVerifyView,
    MfaVerifyView,
    MfaLoginVerifyView,
    MedicationViewSet,
    MedicationLogViewSet,
    DailyLogViewSet,
)

router = DefaultRouter()
router.register("children", ChildViewSet, basename="children")
router.register(r"journal", CareNoteViewSet, basename="journal")
router.register("medications", MedicationViewSet, basename="medications")
router.register("medication-logs", MedicationLogViewSet, basename="medication-logs")
router.register("daily-logs", DailyLogViewSet, basename="daily-logs")

urlpatterns = [
    path("register/", RegisterView.as_view(),                name="register"),
    path("login/",    ThrottledTokenObtainPairView.as_view(), name="login"),
    path("refresh/",  TokenRefreshView.as_view(),             name="token_refresh"),
    path("logout/",   LogoutView.as_view(),                   name="logout"),
    path("me/",       MeView.as_view(),                       name="me"),
    path("mfa/setup/", MfaSetupView.as_view(), name="mfa_setup"),
    path("mfa/verify/", MfaVerifyView.as_view(), name="mfa_verify"),
    path("mfa/login/", MfaLoginVerifyView.as_view(), name="mfa_login_verify"),
    path("",          include(router.urls)),
]
