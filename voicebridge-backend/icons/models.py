# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models


def _validate_max_size(file, max_mb=10):
    """Validate file size at the model layer as a second line of defence."""
    if file.size > max_mb * 1024 * 1024:
        raise ValidationError(f"File exceeds {max_mb} MB limit.")


def validate_image(file):
    _validate_max_size(file, max_mb=5)


def validate_audio(file):
    _validate_max_size(file, max_mb=3)


class Icon(models.Model):
    """
    A single tap-to-speak tile.
    When the child taps this on their tablet, the audio plays immediately.
    Both image and audio are stored as local files so the app works offline.
    """

    class Category(models.TextChoices):
        FOOD       = "FOOD",       "Food & Drink"
        EMOTIONS   = "EMOTIONS",   "Emotions"
        BODY       = "BODY",       "Body & Hygiene"
        ACTIVITIES = "ACTIVITIES", "Activities"
        PEOPLE     = "PEOPLE",     "People"
        PLACES     = "PLACES",     "Places"
        REQUESTS   = "REQUESTS",   "Requests & Needs"
        EMERGENCY  = "EMERGENCY",  "Emergency"
        OTHER      = "OTHER",      "Other"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="icons",
    )
    label = models.CharField(
        max_length=80,
        help_text="Short caption shown beside the icon, e.g. 'Water'.",
    )
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )
    image = models.ImageField(
        upload_to="icons/images/%Y/%m/",
        validators=[
            FileExtensionValidator(["png", "jpg", "jpeg", "webp"]),
            validate_image,
        ],
    )
    audio = models.FileField(
        upload_to="icons/audio/%Y/%m/",
        validators=[
            FileExtensionValidator(["mp3", "wav", "m4a", "ogg"]),
            validate_audio,
        ],
        help_text="The voice the child will hear when tapping this icon.",
    )
    # TTS fallback — used by the Android app if the audio file is unavailable
    tts_text = models.CharField(
        max_length=160, blank=True,
        help_text="Text-to-speech fallback text used by the Android app.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "label"]
        indexes = [
            models.Index(fields=["owner", "category"]),
            models.Index(fields=["updated_at"]),  # speeds up incremental sync
        ]

    def __str__(self) -> str:
        return f"{self.label} [{self.category}]"
