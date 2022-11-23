from django.db import models


class AnnotatedSentence(models.Model):
    id = models.CharField(primary_key=True, editable=False, max_length=20)
    language = models.CharField(max_length=10,
                                choices=(('ENG', 'English'),
                                         ('FIL', 'Tagalog'),
                                         ('TAGLISH', 'Taglish')))
    raw = models.TextField()
    annotated = models.TextField()
