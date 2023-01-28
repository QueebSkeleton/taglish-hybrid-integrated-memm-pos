from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings

from django.contrib.auth.decorators import login_required

import csv
import dill
import gcld3

from ..models import AnnotatedSentence, OnlineModel
from ..utils import transform_into_listtuple, TOKEN_PATTERN


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

    langdetector = gcld3.NNetLanguageIdentifier(
        min_num_bytes=0, max_num_bytes=1000)

    langresult = langdetector.FindLanguage(text=input_sentence)

    if not langresult.is_reliable or langresult.language not in ['en', 'fil']:
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

    langdetector = gcld3.NNetLanguageIdentifier(
        min_num_bytes=0, max_num_bytes=1000)

    langresult = langdetector.FindLanguage(text=input_sentence)

    if not langresult.is_reliable or langresult.language not in ['en', 'fil']:
        return JsonResponse({'error': 'Text is not Tagalog/English/Taglish.'})

    tokens = TOKEN_PATTERN.findall(input_sentence)

    # Load the model
    # TODO: Handle no model scenario
    online_model = OnlineModel.objects.order_by('-trained_on')[0]
    tagger = dill.loads(online_model.trained_model)
    annotated_sentence = tagger.tag(tokens)
    # Transform into a JSON
    return JsonResponse({'annotation':
                         [{'tag': annotated_token[1],
                           'token': annotated_token[0]}
                          for annotated_token in annotated_sentence]})


def online_model_health(request):
    # Fetch sentences
    tl_sentences = AnnotatedSentence.objects.filter(language='TAGALOG')
    en_sentences = AnnotatedSentence.objects.filter(language='ENGLISH')
    tg_sentences = AnnotatedSentence.objects.filter(language='TAGLISH')
    tl_sentences_notvalidated = tl_sentences.filter(is_validated=False)
    tl_sentences_validated = tl_sentences.filter(is_validated=True)
    en_sentences_notvalidated = en_sentences.filter(is_validated=False)
    en_sentences_validated = en_sentences.filter(is_validated=True)
    tg_sentences_notvalidated = tg_sentences.filter(is_validated=False)
    tg_sentences_validated = tg_sentences.filter(is_validated=True)

    # Fetch last 7 model iterations
    online_models = list(OnlineModel.objects.order_by('-id')[:7])
    online_models.reverse()

    return JsonResponse({
        "datasetSummary": {
            "tagalog": {"validated": len(tl_sentences_validated),
                        "nonvalidated": len(tl_sentences_notvalidated)},
            "english": {"validated": len(en_sentences_validated),
                        "nonvalidated": len(en_sentences_notvalidated)},
            "taglish": {"validated": len(tg_sentences_validated),
                        "nonvalidated": len(tg_sentences_notvalidated)}},
        "modelHealth": {
            "dates": [model.trained_on.strftime("%m/%d/%Y %H%p")
                      for model in online_models],
            "tagalogPerformance": [
                model.fmeasure_tagalog for model in online_models],
            "englishPerformance": [
                model.fmeasure_english for model in online_models],
            "taglishPerformance": [
                model.fmeasure_taglish for model in online_models],
        }})


def contact(request):
    return render(request, "tagger/contact.html", {})
