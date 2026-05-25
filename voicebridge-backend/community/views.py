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
