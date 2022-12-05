from django.urls import path, reverse_lazy

from django.contrib.auth import views as auth_views

from . import views

app_name = "tagger"

urlpatterns = [
    path("", views.index, name="index"),
    path("about/", views.about, name="about"),
    path("cite/", views.cite, name="cite"),
    path("annotator/", views.annotator, name="annotator"),
    path("browse-dataset/", views.browse_dataset, name="browse_dataset"),
    path("annotated-sentence/<str:id>/", views.fetch_annotated_sentence,
         name="fetch_annotated_sentence"),
    path("tokenize/", views.tokenize, name="tokenize"),
    path("save-sentence/", views.add_sentence_to_dataset,
         name="add_sentence_to_dataset"),
    path("remove-sentences-from-session/", views.remove_sentences_from_session,
         name="remove_sentences_from_session"),
    path("csv-sentences-session/", views.get_session_sentences_as_csv,
         name="get_session_sentences_as_csv"),
    path("online-model/", views.online_model, name="online_model"),
    path("contact/", views.contact, name="contact"),
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
]
