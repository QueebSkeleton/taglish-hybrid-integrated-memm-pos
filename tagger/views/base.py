from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

import csv

from nltk.tokenize import word_tokenize

from ..models import AnnotatedSentence
from ..utils import transform_into_listtuple


def index(request):
    return render(request, "tagger/index.html", {})


def about(request):
    return render(request, "tagger/about.html", {})


def cite(request):
    return render(request, "tagger/cite.html", {})


@login_required(login_url=settings.TAGGER_LOGIN_URL)
def annotator(request):
    return render(request, "tagger/annotator.html", {})


def tokenize(request):
    input_sentence = request.GET.get('sentence')
    tokens = word_tokenize(input_sentence)
    return JsonResponse({'tokens': tokens})


def fetch_annotated_sentence(request, id):
    annotated_sentence = AnnotatedSentence.objects.get(pk=id).annotated

    if not annotated_sentence:
        return HttpResponse(status=404)

    # Transform annotation into a list of 2-tuples
    annotation_as_list = transform_into_listtuple(annotated_sentence)
    # Transform into a JSON
    return JsonResponse({'annotation':
                         [{'tag': annotated_token[0],
                           'token': annotated_token[1]}
                          for annotated_token in annotation_as_list]})


def dataset_csv(request):
    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="dataset.csv"'})
    csv_writer = csv.writer(response)
    csv_writer.writerow(['id', 'language', 'raw', 'annotated'])

    annotated_sentences = AnnotatedSentence.objects.all()
    for annotated_sentence in annotated_sentences:
        csv_writer.writerow([annotated_sentence.id,
                             annotated_sentence.language,
                             annotated_sentence.raw,
                             annotated_sentence.annotated])
    return response


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def contact(request):
    return render(request, "tagger/contact.html", {})
