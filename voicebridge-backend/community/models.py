from django.conf import settings
from django.db import models


class Template(models.Model):
    """
    A community-shared board layout that caregivers can clone into their account.
    Layout is stored as JSON (not FKs to Icon) so cloning is safe even if the
    original author deletes their account or icons.
    """

    class Status(models.TextChoices):
        PENDING  = "PENDING",  "Pending review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="templates",
    )
    name = models.CharField(max_length=120)
    description = models.TextField()
    scenario = models.CharField(
        max_length=40,
        help_text="e.g. 'Mealtime', 'School Day', 'Doctor visit', 'Emergency'",
        db_index=True,
    )
    language = models.CharField(max_length=10, default="en", db_index=True)

    # JSON snapshot — schema: {rows, cols, items: [{label, category,
    #   image_url, audio_url, tts_text, row, col}, ...]}
    layout = models.JSONField()

    cover = models.ImageField(
        upload_to="templates/covers/", null=True, blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-download_count", "-created_at"]
        indexes = [
            models.Index(fields=["status", "scenario"]),
            models.Index(fields=["language"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} [{self.scenario}/{self.language}]"
