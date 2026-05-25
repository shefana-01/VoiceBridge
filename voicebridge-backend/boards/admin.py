# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.contrib import admin
from .models import Board, BoardItem


class BoardItemInline(admin.TabularInline):
    model = BoardItem
    extra = 0


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "child", "rows", "cols",
                    "is_active", "updated_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "owner__username", "child__name")
    inlines = [BoardItemInline]
    readonly_fields = ("created_at", "updated_at")
