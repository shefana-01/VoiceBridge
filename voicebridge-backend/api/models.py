# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

import uuid
from django.db import models
from django.contrib.auth.models import User

class BaseModel(models.Model):
    """
    Abstract base model that provides self-updating 'created_at' and 'updated_at' fields,
    as well as 'is_deleted' for soft-deleting records to prevent accidental data loss.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.save()

class ChildProfile(BaseModel):
    """Profile for the non-verbal child using the tablet."""
    caregiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    name = models.CharField(max_length=100)
    device_linked = models.BooleanField(default=False, help_text="True if a tablet has been synced")

    class Meta:
        indexes = [
            models.Index(fields=['caregiver', 'is_deleted']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (Caregiver: {self.caregiver.username})"

class CommunicationBoard(BaseModel):
    """A collection of icons (e.g., 'Mealtime', 'Bathroom', 'Playtime')."""
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='boards')
    title = models.CharField(max_length=100)
    
    # Versioning is crucial for offline sync. When a caregiver updates the board, version increments.
    version = models.IntegerField(default=1)
    
    is_active = models.BooleanField(default=True, help_text="Can be hidden without deleting")

    class Meta:
        indexes = [
            models.Index(fields=['child', 'is_active', 'is_deleted']),
        ]
        ordering = ['title']

    def save(self, *args, **kwargs):
        if self.pk is not None:
            self.version += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Board v{self.version}: {self.title} for {self.child.name}"

class Icon(BaseModel):
    """The individual clickable items (image + mother tongue audio) on a board."""
    board = models.ForeignKey(CommunicationBoard, on_delete=models.CASCADE, related_name='icons')
    
    label = models.CharField(max_length=100)
    image = models.ImageField(upload_to='icons/images/', blank=True, null=True)
    audio = models.FileField(upload_to='icons/audio/', help_text="Upload custom mother tongue audio")
    
    # Positioning for the React 'Canva-style' drag-and-drop dashboard
    grid_position_x = models.IntegerField(default=0)
    grid_position_y = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['board', 'is_active', 'is_deleted']),
        ]
        ordering = ['grid_position_y', 'grid_position_x']

    def save(self, *args, **kwargs):
        # Whenever an icon is changed, we MUST update the parent board's version
        # so the tablet knows to re-download the changes.
        super().save(*args, **kwargs)
        self.board.save() # Triggers version increment on board

    def __str__(self):
        return f"Icon: {self.label} on {self.board.title}"
