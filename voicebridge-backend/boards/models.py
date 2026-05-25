from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from icons.models import Icon


class Board(models.Model):
    """
    A page of icons that the child sees on their tablet.
    e.g. 'Mealtime', 'School', 'Emergencies'.
    Each board belongs to one child so every child gets their own set.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="boards",
    )
    child = models.ForeignKey(
        "accounts.Child",
        on_delete=models.CASCADE,
        related_name="boards",
        null=True, blank=True,
        help_text="Which child this board is for. Optional for shared templates.",
    )
    name = models.CharField(max_length=80)
    description = models.TextField(blank=True)

    # Caregiver configures grid size — 3×3 for toddlers, 6×8 for advanced users
    rows = models.PositiveSmallIntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )
    cols = models.PositiveSmallIntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )

    background_color = models.CharField(
        max_length=7, default="#FFFFFF",
        help_text="Hex colour for the canvas background.",
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Inactive boards are not synced to the child's device.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    icons = models.ManyToManyField(
        Icon,
        through="BoardItem",
        related_name="boards",
    )

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["owner", "is_active"]),
            models.Index(fields=["child"]),
            models.Index(fields=["updated_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.rows}×{self.cols})"


class BoardItem(models.Model):
    """
    The placement of an Icon on a Board at a specific (row, col) position.
    Using a through-table instead of a JSON blob means:
    - Reordering one icon updates a single row, not the whole board.
    - Grid uniqueness is enforced at the database level.
    """
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="items"
    )
    icon = models.ForeignKey(
        Icon, on_delete=models.PROTECT,  # protect: don't delete icons still in use
        related_name="placements",
    )
    row = models.PositiveSmallIntegerField()
    col = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["row", "col"]
        constraints = [
            models.UniqueConstraint(
                fields=["board", "row", "col"],
                name="unique_cell_per_board",
            ),
        ]
        indexes = [models.Index(fields=["board", "row", "col"])]

    def __str__(self) -> str:
        return f"{self.icon.label} @ ({self.row},{self.col}) on {self.board.name}"


class BoardVersion(models.Model):
    """A point-in-time snapshot of a Board's layout.

    `layout_data` stores the complete cell→icon mapping as JSON so we can
    rehydrate the board without needing a separate through-table to
    survive icon deletions. If an icon is later deleted from the library,
    the version still knows the label/category that was there.
    """

    board = models.ForeignKey(
        Board, related_name="versions", on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    layout_data = models.JSONField(
        help_text="Frozen list of {row, col, icon_id, label, image_url, audio_url}")
    change_summary = models.CharField(
        max_length=200, blank=True,
        help_text="Optional human-readable note about what changed.")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="board_versions",
        on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["board", "version_number"],
                name="uniq_board_version_number"),
        ]
        indexes = [
            models.Index(fields=["board", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.board.name} v{self.version_number}"

