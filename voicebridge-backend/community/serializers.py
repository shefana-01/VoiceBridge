from rest_framework import serializers
from .models import Template


class TemplateSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.get_full_name", read_only=True
    )

    class Meta:
        model = Template
        fields = ("id", "name", "description", "scenario", "language",
                  "layout", "cover", "status", "download_count",
                  "author_name", "created_at", "updated_at")
        read_only_fields = ("id", "status", "download_count",
                            "author_name", "created_at", "updated_at")
