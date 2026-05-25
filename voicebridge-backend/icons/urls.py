from rest_framework.routers import DefaultRouter
from .views import IconViewSet

router = DefaultRouter()
router.register("", IconViewSet, basename="icons")
urlpatterns = router.urls
