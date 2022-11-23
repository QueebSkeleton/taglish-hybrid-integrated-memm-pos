from django.contrib import admin

from .models import AnnotatedSentence


@admin.register(AnnotatedSentence)
class AnnotatedSentenceModelAdmin(admin.ModelAdmin):
    list_display = ('id', 'language', 'raw',)
    search_fields = ('id',)
