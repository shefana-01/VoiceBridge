# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.db.models import F
from rest_framework import permissions, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Template
from .serializers import TemplateSerializer


class TemplateViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Approved templates are visible to all authenticated users.
    Any caregiver can submit a template — it starts in PENDING and an admin
    must approve it before it appears in the community hub.
    """
    serializer_class = TemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Template.objects.filter(status=Template.Status.APPROVED)
        scenario = self.request.query_params.get("scenario")
        language = self.request.query_params.get("language")
        if scenario:
            qs = qs.filter(scenario__iexact=scenario)
        if language:
            qs = qs.filter(language__iexact=language)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"], url_path="download")
    def download(self, request, pk=None):
        """
        POST /api/v1/community/templates/<id>/download/
        Atomically increments the download counter and returns the template.
        """
        Template.objects.filter(pk=pk).update(
            download_count=F("download_count") + 1
        )
        tmpl = self.get_object()
        return Response(self.get_serializer(tmpl).data)

from accounts.models import CareNote
from .serializers import SharedCareNoteSerializer

class SharedCareNoteViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Read-only view for shared care notes.
    """
    serializer_class = SharedCareNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CareNote.objects.filter(is_shared=True).select_related('caregiver').order_by('-created_at')

from icons.models import Icon
from .serializers import SharedIconSerializer
from django.core.files.base import ContentFile
from rest_framework import status

class SharedIconViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Read-only view for shared icons, with a clone action to add to own library.
    """
    serializer_class = SharedIconSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Icon.objects.filter(is_shared=True).select_related('owner').order_by('-created_at')
        lang = self.request.query_params.get("language")
        q = self.request.query_params.get("q")
        if lang:
            qs = qs.filter(language__iexact=lang)
        if q:
            qs = qs.filter(label__icontains=q)
        return qs

    @action(detail=True, methods=["post"], url_path="clone")
    def clone(self, request, pk=None):
        shared_icon = self.get_object()
        new_icon = Icon.objects.create(
            owner=request.user,
            label=shared_icon.label,
            category=shared_icon.category,
            tts_text=shared_icon.tts_text,
            is_shared=False,
            language=shared_icon.language
        )
        if shared_icon.image:
            new_icon.image.save(shared_icon.image.name.split('/')[-1], ContentFile(shared_icon.image.read()), save=False)
        if shared_icon.audio:
            new_icon.audio.save(shared_icon.audio.name.split('/')[-1], ContentFile(shared_icon.audio.read()), save=False)
        new_icon.save()
        
        from icons.serializers import IconSerializer
        return Response(IconSerializer(new_icon, context={'request': request}).data, status=status.HTTP_201_CREATED)
