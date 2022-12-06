from django.urls import path, reverse_lazy, include
from django.contrib.auth import views as auth_views

from rest_framework import routers

from . import views


router = routers.DefaultRouter()
router.register(r'sentences', views.AnnotatedSentenceViewSet)

app_name = "tagger"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("cite/", views.cite, name="cite"),
    path("annotator/", views.annotator, name="annotator"),
    path("tokenize/", views.tokenize, name="tokenize"),
    path("online-model/", views.online_model, name="online_model"),
    path("contact/", views.contact, name="contact"),
    path("annotated-sentence/<str:id>/", views.fetch_annotated_sentence,
         name="fetch_annotated_sentence"),
    # Session sentences
    path("session-sentences/", views.browse_session_sentences,
         name="browse_session_sentences"),
    path("session-sentences/save/", views.add_session_sentence,
         name="add_session_sentence"),
    path("session-sentences/clear/", views.remove_sentences_from_session,
         name="remove_sentences_from_session"),
    path("session-sentences/csv/", views.get_session_sentences_as_csv,
         name="get_session_sentences_as_csv"),
    # Auth
    path("login/",
         auth_views.LoginView.as_view(
             template_name=f"{app_name}/login.html",
             next_page=reverse_lazy(f"{app_name}:index")),
         name="login"),
    path("logout/",
         auth_views.LogoutView.as_view(
             template_name=f"{app_name}/logged_out.html"),
         name="logout"),
    path("password-change/",
         auth_views.PasswordChangeView.as_view(
             template_name=f"{app_name}/password_change_form.html",
             success_url=reverse_lazy(f"{app_name}:password_change_done")),
         name="password_change"),
    path("password-change/done/",
         auth_views.PasswordChangeDoneView.as_view(
             template_name=f"{app_name}/password_change_done.html"),
         name="password_change_done"),
    # API
    path("api/", include(router.urls)),
]
