import random

from ..utils import ANNOTATED_TOKEN_PATTERN

from ..models import AnnotatedSentence

from ..pos_model import MaxentMarkovPosTagger


def prepare_sentences(sentences):
    dataset = []
    for sentence in sentences:
        dataset.append(
            [(res.group(2).lower(), res.group(1))
             for res in ANNOTATED_TOKEN_PATTERN.finditer(sentence.annotated)])
    return dataset


def randomize_then_split(dataset):
    TRAIN_PERCENT = 0.8

    random.shuffle(dataset)

    training_set = dataset[:int(len(dataset)*TRAIN_PERCENT)]
    testing_set = dataset[int(len(dataset)*TRAIN_PERCENT):]

    return (training_set, testing_set)


def train_online_model(request):
    tagalog_sentences = AnnotatedSentence.objects.filter(language='TAGALOG')
    english_sentences = AnnotatedSentence.objects.filter(language='ENGLISH')
    taglish_sentences = AnnotatedSentence.objects.filter(language='TAGLISH')

    # Format dataset
    tagalog_dataset = randomize_then_split(
        prepare_sentences(tagalog_sentences))
    english_dataset = randomize_then_split(
        prepare_sentences(english_sentences))
    taglish_dataset = randomize_then_split(
        prepare_sentences(taglish_sentences))

    training_set = tagalog_dataset[0] + taglish_dataset[0]


    # Train the model
    tagger = MaxentMarkovPosTagger()
    tagger.train(training_set)
    print(tagger.tag("@COMELEC So ano yung napabalita na pag-bibigay ng palugit na sagutin ni Marcos ? Di ba pwedeng pag wala wala ? That's how this administrations work besides kahit meron nga ninanakaw eh , remember Trillanes papers sa AFP . Duh ... ".split()))
