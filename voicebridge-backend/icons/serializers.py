# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from rest_framework import serializers
from .models import Icon


class IconSerializer(serializers.ModelSerializer):
    # Absolute URLs so the Android client can download files directly to local storage
    image = serializers.ImageField(use_url=True)
    audio = serializers.FileField(use_url=True)

    class Meta:
        model = Icon
        fields = ("id", "label", "category", "image", "audio",
                  "tts_text", "is_shared", "language", "is_folder_dp", "arasaac_id", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
