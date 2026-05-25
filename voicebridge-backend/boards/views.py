# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Board, BoardVersion
from .serializers import BoardSerializer, BoardVersionSerializer


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Board.objects.filter(owner=self.request.user)\
                          .prefetch_related("items__icon")
        child_id = self.request.query_params.get("child")
        if child_id and child_id.isdigit():
            qs = qs.filter(child_id=int(child_id))
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="sync")
    def sync(self, request):
        """
        GET /api/v1/boards/sync/?child=<id>&modified_since=<iso>

        The Android app calls this on startup.
        Returns only boards that changed since the last sync — one round trip,
        everything needed to render offline is embedded in the response.

        Response: { boards: [...], synced_at: <ISO timestamp> }
        The client stores synced_at and sends it back next time as modified_since.
        """
        from django.utils import timezone

        qs = self.get_queryset().filter(is_active=True)
        since = request.query_params.get("modified_since")
        if since:
            dt = parse_datetime(since)
            if dt:
                qs = qs.filter(updated_at__gt=dt)

        data = self.get_serializer(qs, many=True).data
        return Response({
            "boards": data,
            "synced_at": timezone.now().isoformat(),
        })

    @action(detail=True, methods=["post"], url_path="save_version")
    def save_version(self, request, pk=None):
        """Snapshot the current board state into a new BoardVersion row.

        Body (optional):
            { "change_summary": "Adjusted snack icons for grade 2" }

        Returns the newly-created version with HTTP 201.
        """
        board = self.get_object()

        # Compute next version number atomically — UniqueConstraint will
        # reject duplicates if two saves race; in that case the second
        # request retries with the incremented number.
        last = BoardVersion.objects.filter(board=board) \
                                   .order_by("-version_number").first()
        next_number = (last.version_number + 1) if last else 1

        # Freeze the current layout, including denormalized icon details
        # so the version is readable even if the icon is later deleted.
        from .models import BoardItem
        items = BoardItem.objects.filter(board=board).select_related("icon")
        layout = [
            {
                "row":       it.row,
                "col":       it.col,
                "icon_id":   it.icon_id,
                "label":     it.icon.label if it.icon else "",
                "category":  it.icon.category if it.icon else "OTHER",
                "image_url": it.icon.image.url
                             if (it.icon and it.icon.image) else None,
                "audio_url": it.icon.audio.url
                             if (it.icon and it.icon.audio) else None,
            }
            for it in items
        ]

        version = BoardVersion.objects.create(
            board=board,
            version_number=next_number,
            layout_data=layout,
            change_summary=request.data.get("change_summary", ""),
            created_by=request.user,
        )
        ser = BoardVersionSerializer(version, context={"request": request})
        return Response(ser.data, status=201)

    @action(detail=True, methods=["get"], url_path="versions")
    def versions(self, request, pk=None):
        """List every saved version for this board, newest first."""
        board = self.get_object()
        qs = board.versions.all()
        ser = BoardVersionSerializer(qs, many=True,
                                     context={"request": request})
        return Response(ser.data)
