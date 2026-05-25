# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

API_V1 = "api/v1/"

urlpatterns = [
    path("", RedirectView.as_view(url="/api/docs/", permanent=False)),
    path("admin/", admin.site.urls),

    path(f"{API_V1}auth/",      include("accounts.urls")),
    path(f"{API_V1}boards/",    include("boards.urls")),
    path(f"{API_V1}icons/",     include("icons.urls")),
    path(f"{API_V1}community/", include("community.urls")),
    path(f"{API_V1}analytics/", include("analytics.urls")),

    # Auto-generated API documentation (open /api/docs/ in browser)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

# Serve media files in development — use Nginx/S3 in production
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
