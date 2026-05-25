from django.db import transaction
from rest_framework import serializers

from icons.serializers import IconSerializer
from icons.models import Icon
from .models import Board, BoardItem, BoardVersion


class BoardItemSerializer(serializers.ModelSerializer):
    icon = IconSerializer(read_only=True)
    icon_id = serializers.PrimaryKeyRelatedField(
        queryset=Icon.objects.all(), source="icon", write_only=True
    )

    class Meta:
        model = BoardItem
        fields = ("id", "icon", "icon_id", "row", "col")


class BoardSerializer(serializers.ModelSerializer):
    items = BoardItemSerializer(many=True, required=False)

    class Meta:
        model = Board
        fields = ("id", "name", "description", "rows", "cols",
                  "background_color", "is_active", "child",
                  "items", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        board = Board.objects.create(**validated_data)
        self._set_items(board, items_data)
        return board

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            self._set_items(instance, items_data)
        return instance

    @staticmethod
    def _set_items(board, items_data):
        """Bulk create board items and enforce no duplicate cells."""
        seen = set()
        for itm in items_data:
            cell = (itm["row"], itm["col"])
            if cell in seen:
                raise serializers.ValidationError(
                    f"Duplicate cell at row={cell[0]} col={cell[1]}"
                )
            seen.add(cell)

        BoardItem.objects.bulk_create([
            BoardItem(board=board, icon=itm["icon"],
                      row=itm["row"], col=itm["col"])
            for itm in items_data
        ])

    def validate(self, attrs):
        rows = attrs.get("rows", getattr(self.instance, "rows", 4))
        cols = attrs.get("cols", getattr(self.instance, "cols", 4))
        items = attrs.get("items", []) or []
        for itm in items:
            if not (0 <= itm["row"] < rows and 0 <= itm["col"] < cols):
                raise serializers.ValidationError(
                    f"Item at ({itm['row']},{itm['col']}) is outside the "
                    f"{rows}×{cols} grid."
                )
        return attrs


class BoardVersionSerializer(serializers.ModelSerializer):
    """Read-only serializer for browsing version history."""

    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BoardVersion
        fields = [
            "id", "board", "version_number", "layout_data",
            "change_summary", "created_by", "created_by_name", "created_at",
        ]
        read_only_fields = ["id", "board", "version_number",
                            "created_by", "created_at"]

    def get_created_by_name(self, obj):
        u = obj.created_by
        if not u: return None
        return u.get_full_name() or u.username
