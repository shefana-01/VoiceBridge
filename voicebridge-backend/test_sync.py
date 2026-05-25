import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from boards.models import Board
from boards.serializers import BoardSerializer

factory = APIRequestFactory()
request = factory.get('/api/v1/boards/sync/')

board = Board.objects.first()
if board:
    ser = BoardSerializer(board, context={'request': request})
    print(ser.data['items'][0]['icon'])
else:
    print("No boards")
