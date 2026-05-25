# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from rest_framework.routers import DefaultRouter
from .views import BoardViewSet

router = DefaultRouter()
router.register("", BoardViewSet, basename="boards")
urlpatterns = router.urls
