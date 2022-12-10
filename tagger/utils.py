
import re

ANNOTATED_TOKEN_PATTERN = re.compile(r"<\s*(ADJ|ADV|INTJ|NOUN|PROPN|VERB|ADP"
                                     r"|AUX|CCONJ|DET|NUM|PART|PRON|SCONJ"
                                     r"|PUNCT|SYM|X)\s+(\S+)\s*>")


def transform_into_listtuple(annotated_sentence):
    return ANNOTATED_TOKEN_PATTERN.findall(annotated_sentence)
