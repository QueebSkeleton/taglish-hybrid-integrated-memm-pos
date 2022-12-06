from rest_framework import viewsets

from ..models import AnnotatedSentence
from ..serializers import AnnotatedSentenceSerializer


class AnnotatedSentenceViewSet(viewsets.ModelViewSet):
    queryset = AnnotatedSentence.objects.all()
    serializer_class = AnnotatedSentenceSerializer
