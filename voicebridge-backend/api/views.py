# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ChildProfile, CommunicationBoard, Icon
from .serializers import ChildProfileSerializer, CommunicationBoardSerializer, IconSerializer

class ChildProfileViewSet(viewsets.ModelViewSet):
    queryset = ChildProfile.objects.all()
    serializer_class = ChildProfileSerializer

class CommunicationBoardViewSet(viewsets.ModelViewSet):
    queryset = CommunicationBoard.objects.all()
    serializer_class = CommunicationBoardSerializer

class IconViewSet(viewsets.ModelViewSet):
    queryset = Icon.objects.all()
    serializer_class = IconSerializer
    
    # Allows the view to accept files (images and audio) from React
    parser_classes = (MultiPartParser, FormParser)
