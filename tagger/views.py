from django.shortcuts import render
from django.http import JsonResponse

from nltk.tokenize import word_tokenize


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


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def contact(request):
    return render(request, "tagger/contact.html", {})
