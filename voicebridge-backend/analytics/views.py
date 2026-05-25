from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count
from .models import TapEvent
from .serializers import TapEventSerializer, TapStatsSerializer

class TapEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows TapEvents to be recorded or viewed.
    """
    serializer_class = TapEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Caregivers can only see tap events for their own children
        user = self.request.user
        return TapEvent.objects.filter(child__caregiver=user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        child_id = request.query_params.get('child_id')
        if not child_id:
            return Response({"error": "child_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify ownership
        from accounts.models import Child
        try:
            child = Child.objects.get(id=child_id, caregiver=request.user)
        except Child.DoesNotExist:
            return Response({"error": "Child not found or not owned by user"}, status=status.HTTP_404_NOT_FOUND)

        stats = TapEvent.objects.filter(child=child).values('icon', 'icon__label').annotate(tap_count=Count('id')).order_by('-tap_count')
        serializer = TapStatsSerializer(stats, many=True)
        return Response(serializer.data)
