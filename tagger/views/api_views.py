from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import api_view, permission_classes

from django.http import HttpResponse

from ..models import AnnotatedSentence, AnnotationChangeLog
from ..serializers import AnnotatedSentenceSerializer, UserSerializer

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

import json


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


class AnnotatedSentenceViewSet(viewsets.ModelViewSet):
    authentication_classes = (
        CsrfExemptSessionAuthentication, BasicAuthentication)
    queryset = AnnotatedSentence.objects.all()
    serializer_class = AnnotatedSentenceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(id__icontains=q)
        return queryset


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@login_required
@csrf_exempt
def validate_sentence(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        id = data['id']

        annotated_sentence = AnnotatedSentence.objects.get(pk=id)
        annotated_sentence.is_validated = True
        annotated_sentence.save()

        changelog = AnnotationChangeLog(
            sentence=annotated_sentence,
            by=request.user,
            description='Reviewed and validated this sentence.')
        changelog.save()

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)
