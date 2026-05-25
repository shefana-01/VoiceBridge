# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

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
