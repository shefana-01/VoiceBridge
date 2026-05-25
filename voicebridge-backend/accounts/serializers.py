from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Child

Caregiver = get_user_model()


class CaregiverRegisterSerializer(serializers.ModelSerializer):
    """For new caregiver sign-up. Password is hashed — never stored in plaintext."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Caregiver
        fields = ("username", "email", "password", "password_confirm",
                  "first_name", "last_name", "role", "phone", "organisation")
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        return Caregiver.objects.create_user(**validated_data)


class CaregiverSerializer(serializers.ModelSerializer):
    """Read / update profile info for the logged-in caregiver."""
    class Meta:
        model = Caregiver
        fields = ("id", "username", "email", "first_name", "last_name",
                  "role", "phone", "organisation", "date_joined")
        read_only_fields = fields


class ChildSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Child
        fields = ("id", "name", "date_of_birth", "avatar", "notes",
                  "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

from .models import CareNote

class CareNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareNote
        fields = ["id", "text", "child", "created_at"]
        read_only_fields = ["id", "created_at"]
