# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets, parsers

from .models import Icon
from .serializers import IconSerializer


class IconViewSet(viewsets.ModelViewSet):
    serializer_class = IconSerializer
    permission_classes = (permissions.IsAuthenticated,)
    # Accept file uploads (multipart) as well as JSON metadata
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_queryset(self):
        qs = Icon.objects.filter(owner=self.request.user)

        # Filter by category: ?category=FOOD
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        # Incremental sync — only re-download what changed since last sync
        # ?modified_since=2026-05-01T00:00:00Z
        since = self.request.query_params.get("modified_since")
        if since:
            dt = parse_datetime(since)
            if dt:
                qs = qs.filter(updated_at__gt=dt)

        return qs.order_by("category", "label")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
