from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings

from django.contrib.auth.decorators import login_required

import csv

from ..models import AnnotatedSentence
from ..utils import transform_into_listtuple, TOKEN_PATTERN

import dill

import pycld2 as cld2


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

    # TODO: Maybe make this prefilter non-repetitive
    # with the one used in the online_model endpoint
    # Prefilter with CLD2
    is_reliable, text_bytes, details = cld2.detect(input_sentence)

    if not is_reliable:
        return JsonResponse({'error': 'Text is not Tagalog/English/Taglish.'})

    for language_detail in details:
        if language_detail[1] == 'un':
            continue
        elif language_detail[1] not in ('en', 'tl'):
            return JsonResponse({'error': 'Text is not Tagalog/English/Taglish.'})

    tokens = TOKEN_PATTERN.findall(input_sentence)
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


@login_required(login_url=settings.TAGGER_LOGIN_URL)
def online_model_analytics(request):
    return render(request, "tagger/online_model_analytics.html", {})


def browse_dataset(request):
    return render(request, "tagger/browse_dataset.html", {})


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def online_model_annotate(request):
    input_sentence = request.GET.get('sentence')

    # Prefilter with CLD2
    is_reliable, text_bytes, details = cld2.detect(input_sentence)

    if not is_reliable:
        return JsonResponse({'error': 'Text is not Tagalog/English/Taglish.'})

    for language_detail in details:
        if language_detail[1] == 'un':
            continue
        elif language_detail[1] not in ('en', 'tl'):
            return JsonResponse({'error': 'Text is not Tagalog/English/Taglish.'})

    tokens = TOKEN_PATTERN.findall(input_sentence)

    # Load the model
    with open(settings.BASE_DIR / 'tagger'
              / 'saved_models' / 'tagger.dill', 'rb') as f:
        tagger = dill.load(f)

    annotated_sentence = tagger.tag(tokens)
    # Transform into a JSON
    return JsonResponse({'annotation':
                         [{'tag': annotated_token[1],
                           'token': annotated_token[0]}
                          for annotated_token in annotated_sentence]})


def contact(request):
    return render(request, "tagger/contact.html", {})
