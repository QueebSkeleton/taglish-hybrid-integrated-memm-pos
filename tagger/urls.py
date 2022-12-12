from django.urls import path, reverse_lazy, include
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import csrf_exempt

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
    path("browse-dataset/", views.browse_dataset, name="browse_dataset"),
    path("tokenize/", views.tokenize, name="tokenize"),
    path("online-model/", views.online_model, name="online_model"),
    path("online-model/annotate/", views.online_model_annotate,
         name="online_model_annotate"),
    path("online-model/train/", views.train_online_model,
         name="train_online_model"),
    path("contact/", views.contact, name="contact"),
    path("dataset-csv/", views.dataset_csv, name="dataset_csv"),
    path("annotated-sentence/<str:id>/", views.fetch_annotated_sentence,
         name="fetch_annotated_sentence"),
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
    path("api/current-user/", views.current_user,
         name="current-user"),
    path("api/changelogs/", views.save_changelog,
         name="save_changelog"),
    path("api/", include(router.urls)),
]
