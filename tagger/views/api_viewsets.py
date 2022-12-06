from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from ..models import AnnotatedSentence
from ..serializers import AnnotatedSentenceSerializer

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return 

class AnnotatedSentenceViewSet(viewsets.ModelViewSet):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    queryset = AnnotatedSentence.objects.all()
    serializer_class = AnnotatedSentenceSerializer
