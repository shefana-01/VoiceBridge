"""Migration for CareNote.

Place at: backend/accounts/migrations/0004_carenote.py
(Adjust the dependency below to your accounts app's latest migration —
if Track 3's AuditLog migration is 0003, this 0004 follows it. Otherwise
just run `python manage.py makemigrations accounts`.)

Then:  python manage.py migrate accounts
"""
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CareNote",
            fields=[
                ("id", models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name="ID")),
                ("text", models.TextField(max_length=1000)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("caregiver", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="care_notes",
                    to=settings.AUTH_USER_MODEL)),
                ("child", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="care_notes",
                    to="accounts.child")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="carenote",
            index=models.Index(fields=["caregiver", "-created_at"],
                               name="accounts_ca_caregiv_idx"),
        ),
    ]
