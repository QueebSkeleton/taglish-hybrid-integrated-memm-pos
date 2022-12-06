from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib import messages
from django.conf import settings

import json
import csv

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from ..models import AnnotatedSentence


@login_required(login_url=settings.TAGGER_LOGIN_URL)
def browse_session_sentences(request):
    session_sentence_ids = request.session.get('sentence_ids', [])
    session_sentences = AnnotatedSentence.objects.filter(
        pk__in=session_sentence_ids)
    serialized = [{'id': sentence.id, 'language': sentence.language,
                   'raw': sentence.raw, 'annotated': sentence.annotated}
                  for sentence in session_sentences]
    return JsonResponse(serialized, safe=False)


@login_required(login_url=settings.TAGGER_LOGIN_URL)
@csrf_exempt
def add_session_sentence(request):
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


@login_required(login_url=settings.TAGGER_LOGIN_URL)
def remove_sentences_from_session(request):
    if 'sentence_ids' in request.session:
        del request.session['sentence_ids']
    return HttpResponseRedirect(reverse("tagger:annotator"))


@login_required(login_url=settings.TAGGER_LOGIN_URL)
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
