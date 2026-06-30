# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

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
            
        # Filter by is_folder_dp
        is_dp = self.request.query_params.get("is_folder_dp")
        if is_dp is not None:
            qs = qs.filter(is_folder_dp=is_dp.lower() == 'true')

        # Incremental sync — only re-download what changed since last sync
        # ?modified_since=2026-05-01T00:00:00Z
        since = self.request.query_params.get("modified_since")
        if since:
            dt = parse_datetime(since)
            if dt:
                qs = qs.filter(updated_at__gt=dt)

        return qs.order_by("category", "label")

    def perform_create(self, serializer):
        icon = serializer.save(owner=self.request.user)
        self._auto_place_if_requested(icon)
        
    def perform_update(self, serializer):
        icon = serializer.save()
        self._auto_place_if_requested(icon)

    def _auto_place_if_requested(self, icon):
        board_id = self.request.data.get("add_to_board_id")
        if not board_id:
            return
            
        from boards.models import Board, BoardItem
        try:
            board = Board.objects.get(id=board_id, owner=self.request.user)
            existing = set(BoardItem.objects.filter(board=board).values_list("row", "col"))
            target_row = None
            target_col = None
            for r in range(1, board.rows + 1):
                for c in range(1, board.cols + 1):
                    if (r, c) not in existing:
                        target_row = r
                        target_col = c
                        break
                if target_row is not None:
                    break
            
            if target_row is None:
                board.rows += 1
                board.save(update_fields=['rows'])
                target_row = board.rows
                target_col = 1
                
            BoardItem.objects.create(board=board, icon=icon, row=target_row, col=target_col)
            board.save(update_fields=['updated_at'])
        except Board.DoesNotExist:
            pass

    @action(detail=False, methods=['post'], url_path='arasaac')
    def import_from_arasaac(self, request):
        """
        Imports an icon directly from the ARASAAC library.
        Expected POST payload:
        {
            "arasaac_id": 1234,
            "label": "Apple",
            "category": "FOOD"
        }
        """
        import requests
        from django.core.files.base import ContentFile
        
        arasaac_id = request.data.get('arasaac_id')
        label = request.data.get('label')
        category = request.data.get('category', 'OTHER')
        is_folder_dp = request.data.get('is_folder_dp', False)

        if not arasaac_id or not label:
            return Response({"error": "arasaac_id and label are required."}, status=400)

        # ARASAAC image URL standard
        image_url = f"https://static.arasaac.org/pictograms/{arasaac_id}/{arasaac_id}_300.png"

        try:
            # Download the image from Spain
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            # Create the Icon object
            icon = Icon(
                owner=request.user,
                label=label,
                category=category,
                tts_text=label,  # Use the label as the fallback voice!
                is_folder_dp=(str(is_folder_dp).lower() == 'true'),
                arasaac_id=str(arasaac_id)
            )
            
            # Save the downloaded binary data to the ImageField
            file_name = f"arasaac_{arasaac_id}.png"
            icon.image.save(file_name, ContentFile(response.content), save=True)
            
            self._auto_place_if_requested(icon)
            
            serializer = self.get_serializer(icon)
            return Response(serializer.data, status=201)
            
        except requests.exceptions.RequestException:
            return Response({"error": "Failed to download pictogram from ARASAAC."}, status=502)

