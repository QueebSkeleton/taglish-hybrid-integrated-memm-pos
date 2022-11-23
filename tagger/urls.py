from django.urls import path

from . import views

app_name = "tagger"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("cite/", views.cite, name="cite"),
    path("annotator/", views.annotator, name="annotator"),
    path("browse-dataset/", views.browse_dataset, name="browse_dataset"),
    path("annotated-sentence/<int:id>/", views.fetch_annotated_sentence,
         name="fetch_annotated_sentence"),
    path("tokenize/", views.tokenize, name="tokenize"),
    path("online-model/", views.online_model, name="online_model"),
    path("contact/", views.contact, name="contact"),
]
