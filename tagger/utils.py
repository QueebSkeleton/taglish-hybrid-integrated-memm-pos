
import re

def transform_into_listtuple(annotated_sentence):
    return re.findall(
        r"<(ADJ|ADV|INTJ|NOUN|PROPN|VERB|ADP|AUX|CCONJ|DET|NUM|PART|PRON|SCONJ|PUNCT|SYM|X) (\S*)>",
        annotated_sentence)
