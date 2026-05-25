from rest_framework import serializers
from .models import Icon


class IconSerializer(serializers.ModelSerializer):
    # Absolute URLs so the Android client can download files directly to local storage
    image = serializers.ImageField(use_url=True)
    audio = serializers.FileField(use_url=True)

    class Meta:
        model = Icon
        fields = ("id", "label", "category", "image", "audio",
                  "tts_text", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
