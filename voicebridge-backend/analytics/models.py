# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.db import models
from accounts.models import Child
from icons.models import Icon

class TapEvent(models.Model):
    """
    Records when a child taps an icon. Useful for caregivers/therapists to track usage.
    """
    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name="tap_events"
    )
    icon = models.ForeignKey(
        Icon,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="tap_events"
    )
    timestamp = models.DateTimeField()
    
    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["child", "timestamp"]),
        ]

    def __str__(self) -> str:
        icon_label = self.icon.label if self.icon else "Deleted Icon"
        return f"{self.child.name} tapped '{icon_label}' at {self.timestamp}"
