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
        FOOD         = "FOOD",         "Food & Drink"
        EMOTIONS     = "EMOTIONS",     "Emotions"
        BODY         = "BODY",         "Body & Hygiene"
        ACTIVITIES   = "ACTIVITIES",   "Activities"
        PEOPLE       = "PEOPLE",       "People"
        PLACES       = "PLACES",       "Places"
        REQUESTS     = "REQUESTS",     "Requests & Needs"
        EMERGENCY    = "EMERGENCY",    "Emergency"
        ROUTINES     = "ROUTINES",     "Routines"
        MEDICATIONS  = "MEDICATIONS",  "Medications"
        ANIMALS      = "ANIMALS",      "Animals & Pets"
        CLOTHING     = "CLOTHING",     "Clothing & Accessories"
        TOYS         = "TOYS",         "Toys & Games"
        SCHOOL       = "SCHOOL",       "School & Education"
        COLORS       = "COLORS",       "Colors"
        SHAPES       = "SHAPES",       "Shapes"
        NUMBERS      = "NUMBERS",      "Numbers & Math"
        TIME         = "TIME",         "Time & Days"
        WEATHER      = "WEATHER",      "Weather & Seasons"
        TRANSPORT    = "TRANSPORT",    "Transportation"
        NATURE       = "NATURE",       "Nature & Outdoors"
        HOME         = "HOME",         "Home & Furniture"
        KITCHEN      = "KITCHEN",      "Kitchen & Cooking"
        BATHROOM     = "BATHROOM",     "Bathroom Items"
        BEDROOM      = "BEDROOM",      "Bedroom Items"
        ELECTRONICS  = "ELECTRONICS",  "Electronics & Tech"
        SPORTS       = "SPORTS",       "Sports & Fitness"
        MUSIC        = "MUSIC",        "Music & Instruments"
        ART          = "ART",          "Art & Craft"
        PROFESSIONS  = "PROFESSIONS",  "Jobs & Professions"
        HOLIDAYS     = "HOLIDAYS",     "Holidays & Events"
        CHORES       = "CHORES",       "Chores & Tasks"
        SENSORY      = "SENSORY",      "Sensory Needs"
        SOCIAL       = "SOCIAL",       "Social Greetings"
        QUESTIONS    = "QUESTIONS",    "Questions"
        DESCRIPTIONS = "DESCRIPTIONS", "Adjectives & Descriptions"
        ACTIONS      = "ACTIONS",      "Actions & Verbs"
        PREPOSITIONS = "PREPOSITIONS", "Positions & Directions"
        PRONOUNS     = "PRONOUNS",     "Pronouns"
        FEELINGS     = "FEELINGS",     "Physical Feelings"
        MEDICAL      = "MEDICAL",      "Medical & Doctor"
        THERAPY      = "THERAPY",      "Therapy & Exercises"
        HOBBIES      = "HOBBIES",      "Hobbies & Interests"
        MEDIA        = "MEDIA",        "TV, Movies & Books"
        SNACKS       = "SNACKS",       "Snacks & Treats"
        DRINKS       = "DRINKS",       "Drinks & Beverages"
        VEGETABLES   = "VEGETABLES",   "Vegetables"
        FRUITS       = "FRUITS",       "Fruits"
        DESSERTS     = "DESSERTS",     "Desserts & Sweets"
        UTENSILS     = "UTENSILS",     "Utensils"
        OTHER        = "OTHER",        "Other"

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
        blank=True, null=True,
        validators=[
            FileExtensionValidator(["mp3", "wav", "m4a", "ogg", "webm", "weba"]),
            validate_audio,
        ],
        help_text="The voice the child will hear when tapping this icon.",
    )
    # TTS fallback — used by the Android app if the audio file is unavailable
    tts_text = models.CharField(
        max_length=160, blank=True,
        help_text="Text-to-speech fallback text used by the Android app.",
    )
    # Whether this icon is intended to be a folder cover instead of a grid item
    is_folder_dp = models.BooleanField(
        default=False,
        help_text="If true, this icon only shows in the Folder DP library."
    )
    arasaac_id = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="If imported from ARASAAC, the original ID."
    )

    is_shared = models.BooleanField(default=False)
    language = models.CharField(max_length=40, blank=True, default="English", help_text="e.g. English, Bengali, Spanish")
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
