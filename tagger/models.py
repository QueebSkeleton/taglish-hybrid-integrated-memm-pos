from django.db import models

from django.contrib.auth import models as auth_models


class AnnotatedSentence(models.Model):
    language = models.CharField(max_length=10,
                                choices=(('ENG', 'English'),
                                         ('FIL', 'Tagalog'),
                                         ('TAGLISH', 'Taglish')))
    raw = models.TextField()
    annotated = models.TextField()
    is_validated = models.BooleanField(default=False)
    extra_data = models.JSONField(null=True, blank=True)


class AnnotationChangeLog(models.Model):
    sentence = models.ForeignKey(to=AnnotatedSentence,
                                 on_delete=models.CASCADE)
    by = models.ForeignKey(null=True, to=auth_models.User,
                           on_delete=models.SET_NULL)
    changed_on = models.DateTimeField(auto_now_add=True)
    description = models.TextField()


class OnlineModel(models.Model):
    trained_model = models.BinaryField()
    trained_on = models.DateTimeField(auto_now_add=True)
    testing_set = models.ManyToManyField(to=AnnotatedSentence)
    fmeasure_tagalog = models.FloatField(default=0)
    fmeasure_english = models.FloatField(default=0)
    fmeasure_taglish = models.FloatField(default=0)
