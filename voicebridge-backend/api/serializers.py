from rest_framework import serializers
from .models import ChildProfile, CommunicationBoard, Icon
from django.contrib.auth.models import User

class IconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Icon
        fields = ['id', 'board', 'label', 'image', 'audio', 'grid_position_x', 'grid_position_y', 'created_at']

class CommunicationBoardSerializer(serializers.ModelSerializer):
    # Nested serializer to bring icons with the board
    icons = IconSerializer(many=True, read_only=True)
    
    class Meta:
        model = CommunicationBoard
        fields = ['id', 'child', 'title', 'is_active', 'created_at', 'updated_at', 'icons']

class ChildProfileSerializer(serializers.ModelSerializer):
    boards = CommunicationBoardSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChildProfile
        fields = ['id', 'caregiver', 'name', 'created_at', 'boards']
