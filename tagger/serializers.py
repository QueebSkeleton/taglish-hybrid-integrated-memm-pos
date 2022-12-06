from rest_framework import serializers

from .models import AnnotatedSentence


class AnnotatedSentenceSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.CharField()
    class Meta:
        model = AnnotatedSentence
        fields = ['id', 'language', 'raw', 'annotated']
