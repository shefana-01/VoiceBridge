# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from rest_framework.routers import DefaultRouter
from .views import TemplateViewSet

router = DefaultRouter()
router.register("templates", TemplateViewSet, basename="templates")

from .views import SharedCareNoteViewSet, SharedIconViewSet
router.register("shared-journals", SharedCareNoteViewSet, basename="shared-journals")
router.register("shared-icons", SharedIconViewSet, basename="shared-icons")

urlpatterns = router.urls
