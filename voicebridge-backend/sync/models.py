# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from django.conf import settings
from django.db import models
from accounts.models import Child

class DeviceSync(models.Model):
    """
    Tracks the synchronization status of a child's device (Android tablet).
    """
    child = models.OneToOneField(
        Child,
        on_delete=models.CASCADE,
        related_name="sync_status",
    )
    last_synced_at = models.DateTimeField(auto_now=True)
    device_model = models.CharField(max_length=120, blank=True)
    app_version = models.CharField(max_length=20, blank=True)
    battery_level = models.PositiveSmallIntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ["-last_synced_at"]

    def __str__(self) -> str:
        return f"Sync status for {self.child.name}"
