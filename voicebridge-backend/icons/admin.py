# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.contrib import admin
from .models import Icon


@admin.register(Icon)
class IconAdmin(admin.ModelAdmin):
    list_display = ("label", "category", "owner", "updated_at")
    list_filter = ("category", "created_at")
    search_fields = ("label", "tts_text", "owner__username")
    readonly_fields = ("created_at", "updated_at")
