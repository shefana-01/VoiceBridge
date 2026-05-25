from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boards", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BoardVersion",
            fields=[
                ("id", models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name="ID")),
                ("version_number", models.PositiveIntegerField()),
                ("layout_data", models.JSONField(
                    help_text="Frozen list of {row, col, icon_id, label, image_url, audio_url}")),
                ("change_summary", models.CharField(
                    blank=True, max_length=200,
                    help_text="Optional human-readable note about what changed.")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("board", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="versions", to="boards.board")),
                ("created_by", models.ForeignKey(
                    null=True, blank=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="board_versions",
                    to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="boardversion",
            constraint=models.UniqueConstraint(
                fields=("board", "version_number"),
                name="uniq_board_version_number"),
        ),
        migrations.AddIndex(
            model_name="boardversion",
            index=models.Index(fields=["board", "-created_at"],
                               name="boards_boa_board_i_idx"),
        ),
    ]
