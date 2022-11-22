from django.apps import AppConfig

import nltk


class TaggerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tagger'

    def ready(self):
        super().ready()
        # Install NLTK packages
        nltk.download('punkt')
        # TODO: Prepare the online POS tagger model here
