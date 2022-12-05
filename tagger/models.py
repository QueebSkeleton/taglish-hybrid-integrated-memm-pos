from django.db import models

from django.contrib.auth import models as auth_models


class AnnotatedSentence(models.Model):
    id = models.CharField(primary_key=True, editable=False, max_length=20)
    language = models.CharField(max_length=10,
                                choices=(('ENG', 'English'),
                                         ('FIL', 'Tagalog'),
                                         ('TAGLISH', 'Taglish')))
    raw = models.TextField()
    annotated = models.TextField()


class AnnotationChangeLog(models.Model):
    sentence = models.ForeignKey(to=AnnotatedSentence,
                                 on_delete=models.CASCADE)
    by = models.ForeignKey(null=True, to=auth_models.User,
                           on_delete=models.SET_NULL)
    changed_on = models.DateTimeField(auto_now_add=True)
