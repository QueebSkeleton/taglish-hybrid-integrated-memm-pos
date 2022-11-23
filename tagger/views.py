from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator

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
    return render(request, "tagger/annotator.html", {})


def tokenize(request):
    input_sentence = request.GET.get('sentence')
    tokens = word_tokenize(input_sentence)
    return JsonResponse({'tokens': tokens})


def browse_dataset(request):
    page_size = 25

    dataset = AnnotatedSentence.objects.all()

    paginator = Paginator(dataset, page_size)
    page_obj = paginator.get_page(request.GET.get("page"))

    return render(request, "tagger/browse_dataset.html",
                  {"page_obj": page_obj})


def fetch_annotated_sentence(request, id):
    sentence = AnnotatedSentence.objects.get(pk=id)
    # Transform annotation into a list of 2-tuples
    annotation_as_list = transform_into_listtuple(sentence.annotated)
    # Transform into a JSON
    return JsonResponse({'annotation':
                         [{'tag': annotated_token[0], 'token': annotated_token[1]}
                          for annotated_token in annotation_as_list]})


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def contact(request):
    return render(request, "tagger/contact.html", {})
