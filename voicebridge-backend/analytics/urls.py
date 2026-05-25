# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TapEventViewSet

router = DefaultRouter()
router.register(r'events', TapEventViewSet, basename='tapevent')

urlpatterns = [
    path('', include(router.urls)),
]
