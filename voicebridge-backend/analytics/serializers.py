from rest_framework import serializers
from .models import TapEvent

class TapEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TapEvent
        fields = ['id', 'child', 'icon', 'timestamp']

class TapStatsSerializer(serializers.Serializer):
    icon_id = serializers.IntegerField(source='icon')
    icon_label = serializers.CharField(source='icon__label')
    tap_count = serializers.IntegerField()
