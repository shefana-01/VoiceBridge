from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TapEventViewSet

router = DefaultRouter()
router.register(r'events', TapEventViewSet, basename='tapevent')

urlpatterns = [
    path('', include(router.urls)),
]
