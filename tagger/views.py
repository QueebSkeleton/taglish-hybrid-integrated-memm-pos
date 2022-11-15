from django.shortcuts import render


def index(request):
    return render(request, "tagger/index.html", {})


def about(request):
    return render(request, "tagger/about.html", {})


def cite(request):
    return render(request, "tagger/cite.html", {})


def annotator(request):
    return render(request, "tagger/annotator.html", {})


def online_model(request):
    return render(request, "tagger/online_model.html", {})


def contact(request):
    return render(request, "tagger/contact.html", {})
