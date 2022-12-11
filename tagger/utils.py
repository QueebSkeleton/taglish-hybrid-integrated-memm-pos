
import re

TOKEN_PATTERN = re.compile(r"[!\"$%&()*+,./:;<=>?\\^_`{|}~]"
                           r"|\u00a9|\u00ae|[\u2000-\u3300]"
                           r"|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]"
                           r"|\ud83e[\ud000-\udfff]"
                           r"|[\w\-@#']+")

ANNOTATED_TOKEN_PATTERN = re.compile(r"<\s*(ADJ|ADV|INTJ|NOUN|PROPN|VERB|ADP"
                                     r"|AUX|CCONJ|DET|NUM|PART|PRON|SCONJ"
                                     r"|PUNCT|SYM|X)\s+(\S+)\s*>")


def transform_into_listtuple(annotated_sentence):
    return ANNOTATED_TOKEN_PATTERN.findall(annotated_sentence)
