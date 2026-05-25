from django.contrib import admin
from .models import Template


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "scenario", "language", "author",
                    "status", "download_count", "created_at")
    list_filter = ("status", "scenario", "language")
    search_fields = ("name", "description", "author__username")
    actions = ["approve", "reject"]
    readonly_fields = ("download_count", "created_at", "updated_at")

    @admin.action(description="Approve selected templates")
    def approve(self, request, queryset):
        queryset.update(status=Template.Status.APPROVED)

    @admin.action(description="Reject selected templates")
    def reject(self, request, queryset):
        queryset.update(status=Template.Status.REJECTED)
