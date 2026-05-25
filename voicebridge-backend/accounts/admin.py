# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Caregiver, Child


@admin.register(Caregiver)
class CaregiverAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name",
                    "role", "is_staff", "date_joined")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    fieldsets = UserAdmin.fieldsets + (
        ("VoiceBridge Profile", {
            "fields": ("role", "phone", "organisation"),
        }),
    )


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ("name", "caregiver", "date_of_birth", "created_at")
    search_fields = ("name", "caregiver__username", "caregiver__email")
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "updated_at")
