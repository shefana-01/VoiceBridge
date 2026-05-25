from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChildProfileViewSet, CommunicationBoardViewSet, IconViewSet

router = DefaultRouter()
router.register(r'children', ChildProfileViewSet)
router.register(r'boards', CommunicationBoardViewSet)
router.register(r'icons', IconViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
