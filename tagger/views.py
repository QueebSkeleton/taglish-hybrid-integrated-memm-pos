from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt

import json
import csv

from nltk.tokenize import word_tokenize

from .models import AnnotatedSentence

from .utils import transform_into_listtuple


def index(request):
    return render(request, "tagger/index.html", {})


def about(request):
    return render(request, "tagger/about.html", {})


def cite(request):
    return render(request, "tagger/cite.html", {})


def annotator(request):
    session_sentences = request.session.get('sentences', {}).values()
    return render(request, "tagger/annotator.html",
                  {'session_sentences': session_sentences,
                   'session_sentences_len': len(session_sentences)})


def tokenize(request):
    input_sentence = request.GET.get('sentence')
    tokens = word_tokenize(input_sentence)
    return JsonResponse({'tokens': tokens})


@csrf_exempt
def add_sentence_to_session(request):
    request_body = json.loads(request.body)

    session_sentences = request.session.get('sentences', {})
    session_sentences[request_body['id']] = request_body
    request.session['sentences'] = session_sentences

    return HttpResponse(status=204)


def remove_sentences_from_session(request):
    if 'sentences' in request.session:
        del request.session['sentences']
    return HttpResponseRedirect(reverse("tagger:annotator"))


def get_session_sentences_as_csv(request):
    session_sentences = request.session.get('sentences', {})

    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="dataset.csv"'})
    csv_writer = csv.writer(response)
    csv_writer.writerow(['id', 'language', 'raw', 'annotated'])
    
    for sentence in session_sentences.values():
        csv_writer.writerow([sentence['id'], sentence['language'],
                             sentence['raw'], sentence['annotated']])
    
    return response


def browse_dataset(request):
    page_size = 25

    dataset = AnnotatedSentence.objects.all()

    paginator = Paginator(dataset, page_size)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(request, "tagger/browse_dataset.html",
                  {"page_obj": page_obj})


def fetch_annotated_sentence(request, id):
    # Determines whether the sentence is from database table or session storage
    from_storage = request.GET.get('from', 'session')

    if from_storage == "database":
        annotated_sentence = AnnotatedSentence.objects.get(pk=id).annotated
    elif from_storage == "session":
        annotated_sentence = request.session['sentences'][id]['annotated']

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
