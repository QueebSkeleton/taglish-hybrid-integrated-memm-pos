from rest_framework import serializers

from .models import AnnotatedSentence, AnnotationChangeLog
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class AnnotationChangeLogSerializer(serializers.ModelSerializer):
    by = UserSerializer(read_only=True)
    sentence = serializers.PrimaryKeyRelatedField(
        read_only=True)

    class Meta:
        model = AnnotationChangeLog
        fields = ('by', 'sentence', 'changed_on', 'description',)


class AnnotatedSentenceSerializer(serializers.HyperlinkedModelSerializer):
    annotationchangelog_set = AnnotationChangeLogSerializer(
        many=True, read_only=True)

    class Meta:
        model = AnnotatedSentence
        fields = ('id', 'language', 'raw', 'annotated',
                  'annotationchangelog_set')
