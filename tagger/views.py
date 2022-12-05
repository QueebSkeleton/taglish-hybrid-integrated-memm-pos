from django.contrib import messages
from django.core.paginator import Paginator
from django.urls import reverse, reverse_lazy
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

import json
import csv

from nltk.tokenize import word_tokenize

from .models import AnnotatedSentence
from .utils import transform_into_listtuple

LOGIN_URL = reverse_lazy('tagger:login')


def index(request):
    return render(request, "tagger/index.html", {})


def about(request):
    return render(request, "tagger/about.html", {})


def cite(request):
    return render(request, "tagger/cite.html", {})


@login_required(login_url=LOGIN_URL)
def annotator(request):
    # Fetch session history
    session_sentence_ids = request.session.get('sentence_ids', [])
    session_sentences \
        = AnnotatedSentence.objects.filter(pk__in=session_sentence_ids) \
        if session_sentence_ids else []
    return render(request, "tagger/annotator.html",
                  {'session_sentences': session_sentences})


def tokenize(request):
    input_sentence = request.GET.get('sentence')
    tokens = word_tokenize(input_sentence)
    return JsonResponse({'tokens': tokens})


@login_required(login_url=LOGIN_URL)
@csrf_exempt
def add_sentence_to_dataset(request):
    request_body = json.loads(request.body)

    annotated_sentence = AnnotatedSentence(**request_body)
    # TODO: Handle ID already exists
    annotated_sentence.save()
    messages.add_message(
        request, messages.INFO,
        f'Sentence {annotated_sentence.id} has been saved.')

    # Add this sentence to the session history
    session_sentence_ids = request.session.get('sentence_ids', [])
    session_sentence_ids.append(annotated_sentence.id)
    request.session['sentence_ids'] = session_sentence_ids
    return HttpResponse(status=204)


@login_required(login_url=LOGIN_URL)
def remove_sentences_from_session(request):
    if 'sentence_ids' in request.session:
        del request.session['sentence_ids']
    return HttpResponseRedirect(reverse("tagger:annotator"))


@login_required(login_url=LOGIN_URL)
def get_session_sentences_as_csv(request):
    session_sentence_ids = request.session.get('sentence_ids', [])

    if not session_sentence_ids:
        return HttpResponse('No sentences in session.')

    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="dataset.csv"'})
    csv_writer = csv.writer(response)
    csv_writer.writerow(['id', 'language', 'raw', 'annotated'])

    annotated_sentences \
        = AnnotatedSentence.objects.filter(pk__in=session_sentence_ids)
    for annotated_sentence in annotated_sentences:
        csv_writer.writerow([annotated_sentence.id,
                             annotated_sentence.language,
                             annotated_sentence.raw,
                             annotated_sentence.annotated])

    return response


def browse_dataset(request):
    page_size = 25

    dataset = AnnotatedSentence.objects.all()

    paginator = Paginator(dataset, page_size)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(request, "tagger/browse_dataset.html",
                  {"page_obj": page_obj})


def fetch_annotated_sentence(request, id):
    annotated_sentence = AnnotatedSentence.objects.get(pk=id).annotated

    if not annotated_sentence:
        return HttpResponse(status=404)

    # Transform annotation into a list of 2-tuples
    annotation_as_list = transform_into_listtuple(annotated_sentence)
    # Transform into a JSON
    return JsonResponse({'annotation':
                         [{'tag': annotated_token[0], 'token': annotated_token[1]}
                          for annotated_token in annotation_as_list]})


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def contact(request):
    return render(request, "tagger/contact.html", {})
