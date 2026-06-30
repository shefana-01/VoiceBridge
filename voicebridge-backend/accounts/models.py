# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Caregiver(AbstractUser):
    """
    The adult who logs in to the React admin panel.
    Inherits username, email, password, first_name, last_name from AbstractUser.
    """

    class Role(models.TextChoices):
        PARENT    = "PARENT",    _("Parent / Family")
        THERAPIST = "THERAPIST", _("Speech / OT Therapist")
        TEACHER   = "TEACHER",   _("Teacher / School Staff")
        OTHER     = "OTHER",     _("Other Caregiver")

    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.PARENT,
    )
    phone = models.CharField(max_length=20, blank=True)
    organisation = models.CharField(
        max_length=120, blank=True,
        help_text="School or therapy centre, if applicable.",
    )
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    avatar = models.ImageField(upload_to="caregiver_avatars/%Y/%m/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["-date_joined"]
        verbose_name = "Caregiver"
        verbose_name_plural = "Caregivers"
        indexes = [models.Index(fields=["email"])]

    def __str__(self) -> str:
        return f"{self.get_full_name() or self.username} ({self.role})"


class Child(models.Model):
    """
    A non-verbal individual using VoiceBridge.
    Their boards belong to them, but the Caregiver controls everything
    via the admin panel. The child has no login of their own.
    """
    caregiver = models.ForeignKey(
        Caregiver,
        on_delete=models.CASCADE,
        related_name="children",
    )
    name = models.CharField(max_length=80)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(
        upload_to="avatars/%Y/%m/",
        null=True, blank=True,
    )
    notes = models.TextField(
        blank=True,
        help_text="Private notes (preferences, sensory needs, etc.)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["caregiver", "name"])]

    def __str__(self) -> str:
        return self.name

class CareNote(models.Model):
    """A short mindful reflection logged by a caregiver."""

    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="care_notes",
        on_delete=models.CASCADE)
    child = models.ForeignKey(
        "accounts.Child",
        related_name="care_notes",
        on_delete=models.SET_NULL, null=True, blank=True)
    text = models.TextField(max_length=1000)
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["caregiver", "-created_at"])]

    def __str__(self):
        return f"CareNote by {self.caregiver} @ {self.created_at:%Y-%m-%d}"

class Medication(models.Model):
    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="medications"
    )
    name = models.CharField(max_length=120)
    dose = models.CharField(max_length=80, blank=True)
    frequency = models.CharField(max_length=80, blank=True)
    time = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.dose})"

class MedicationLog(models.Model):
    medication = models.ForeignKey(
        Medication, on_delete=models.CASCADE, related_name="logs"
    )
    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    date = models.DateField()
    time_slot = models.CharField(max_length=40)
    is_done = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('medication', 'date', 'time_slot')

class DailyLog(models.Model):
    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_logs"
    )
    date = models.DateField()
    mood = models.CharField(max_length=10, blank=True)
    sleep = models.CharField(max_length=80, blank=True)
    meals = models.CharField(max_length=120, blank=True)
    therapy = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Daily Log on {self.date}"
