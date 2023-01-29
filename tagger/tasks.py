
from .models import AnnotatedSentence, OnlineModel
from .pos_model import MaxentMarkovPosTagger
from .utils import ANNOTATED_TOKEN_PATTERN
import random
import dill


def prepare_sentences(sentences):
    dataset = []
    for sentence in sentences:
        dataset.append(
            [(res.group(2).lower(), res.group(1))
             for res in ANNOTATED_TOKEN_PATTERN.finditer(sentence.annotated)])
    return dataset


def retrain_online_model():
    tl_sentences = AnnotatedSentence.objects.filter(language='TAGALOG')
    en_sentences = AnnotatedSentence.objects.filter(language='ENGLISH')
    tg_sentences = AnnotatedSentence.objects.filter(language='TAGLISH')

    # For each set, separate the validated and not-validated
    tl_sentences_notvalidated = list(tl_sentences.filter(is_validated=False))
    tl_sentences_validated = list(tl_sentences.filter(is_validated=True))
    en_sentences_notvalidated = list(en_sentences.filter(is_validated=False))
    en_sentences_validated = list(en_sentences.filter(is_validated=True))
    tg_sentences_notvalidated = list(tg_sentences.filter(is_validated=False))
    tg_sentences_validated = list(tg_sentences.filter(is_validated=True))

    tl_sentence_count = len(tl_sentences_validated)
    en_sentence_count = len(en_sentences_validated)
    tg_sentence_count = len(tg_sentences_validated)

    # Calculate the ratios per language set
    tl_test_size = int(tl_sentence_count * 0.2)
    en_test_size = int(en_sentence_count * 0.2)
    tg_test_size = int(tg_sentence_count * 0.2)

    # Extract a testing set from the validated ones,
    # then create the whole training set
    random.shuffle(tl_sentences_validated)
    tl_testing_list = tl_sentences_validated[:tl_test_size]
    tl_training_set = prepare_sentences(tl_sentences_validated[tl_test_size:]) \
        + prepare_sentences(tl_sentences_notvalidated)
    random.shuffle(en_sentences_validated)
    en_testing_list = en_sentences_validated[:en_test_size]
    en_training_set = prepare_sentences(en_sentences_validated[en_test_size:]) \
        + prepare_sentences(en_sentences_notvalidated)
    random.shuffle(tg_sentences_validated)
    tg_testing_list = tg_sentences_validated[:tg_test_size]
    tg_training_set = prepare_sentences(tg_sentences_validated[tg_test_size:]) \
        + prepare_sentences(tg_sentences_notvalidated)

    training_set = tl_training_set + en_training_set + tg_training_set

    # Train the model
    tagger = MaxentMarkovPosTagger()
    tagger.train(training_set)

    # Prepare the testing sets from the lists
    tl_testing_set = prepare_sentences(tl_testing_list)
    en_testing_set = prepare_sentences(en_testing_list)
    tg_testing_set = prepare_sentences(tg_testing_list)

    # Test the models then get the weighted f measures per language
    fmeasure_tagalog = tagger.weighted_f_measure(tl_testing_set)
    fmeasure_english = tagger.weighted_f_measure(en_testing_set)
    fmeasure_taglish = tagger.weighted_f_measure(tg_testing_set)

    # After training, save the model to a django model
    online_model = OnlineModel(trained_model=dill.dumps(tagger),
                               fmeasure_tagalog=fmeasure_tagalog,
                               fmeasure_english=fmeasure_english,
                               fmeasure_taglish=fmeasure_taglish)
    online_model.save()
    # Save the generated testing set for this model
    online_model.testing_set.add(
        *(tl_testing_list + en_testing_list + tg_testing_list))
