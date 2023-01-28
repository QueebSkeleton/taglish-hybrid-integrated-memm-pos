from nltk import TaggerI, FreqDist, untag, config_megam
from nltk.tag.hmm import HiddenMarkovModelTagger
from nltk.classify.maxent import MaxentClassifier

from django.conf import settings

import numpy as np

import re

from collections import defaultdict

from copy import copy


class MaxentMarkovPosTagger(TaggerI):
    """
    A Hidden Markov Model POS Tagger with a Maximum Entropy module integrated in it.
    The main purpose is to tag as normal, but rely on the Maxent module when there
    are unencountered words.

    Parameters of this model:
        - Transition Probability Matrix
        - Emission (Output) Probability Matrix
        - Maximum Entropy Featureset Weights

    The decoder used to derive the tags from a given sentence is the Viterbi algorithm.
    """

    def train(self, tagged_sentences, maxent_algorithm='megam',
              word_count_cutoff=2, feature_count_cutoff=2, **cutoffs):

        # Config NLTK with the megam installation, else fallback to GIS
        if maxent_algorithm == 'megam':
            try:
                config_megam(settings.TAGGER_MEGAM_LOCATION)
            except LookupError:
                maxent_algorithm = 'IIS'

        self.word_freqdist = self.calculate_words_freqdist(tagged_sentences)
        self.word_cutoff = word_count_cutoff
        self.feature_cutoff = feature_count_cutoff

        # Train the HMM
        hmmtagger = HiddenMarkovModelTagger.train(tagged_sentences)
        # Get the parameters from the trained model
        self._states = hmmtagger._states
        self._starting_matrix = hmmtagger._priors
        self._transitions_matrix = hmmtagger._transitions
        self._outputs_matrix = hmmtagger._outputs

        # Train the maxent classifier
        self.featuresets = self.extract_featuresets(tagged_sentences)
        self.features_freqdist = self.calculate_features_freqdist(
            self.featuresets)
        # self.remove_rare_features(self.featuresets)
        self.maxentclassifier = MaxentClassifier.train(self.featuresets,
                                                       maxent_algorithm,
                                                       max_iter=10000,
                                                       **cutoffs)

    def calculate_features_freqdist(self, featuresets):
        features_freqdist = defaultdict(int)
        for (feature_dict, tag) in featuresets:
            for (feature, value) in feature_dict.items():
                features_freqdist[((feature, value), tag)] += 1
        return features_freqdist

    def calculate_words_freqdist(self, tagged_sentences):
        word_freqdist = FreqDist()
        for sentence in tagged_sentences:
            for word_annotation in sentence:
                word_freqdist[word_annotation[0]] += 1
        return word_freqdist

    def calculate_transition_freqdist(self, tagged_sentences):
        pass

    def extract_featuresets(self, tagged_sentences):
        """
        Generates featuresets for each token in the training sentences.
        """
        featuresets = []
        for sentence in tagged_sentences:
            history = []
            untagged = untag(sentence)
            for (i, (_word, tag)) in enumerate(sentence):
                featuresets.append(
                    (self.extract_features(untagged[i]), tag))
                history.append(tag)
        return featuresets

    def remove_rare_features(self, featuresets):
        """
        Removes features from the featureset if its count is beneath
        the defined cutoff.
        """
        for (feature_dict, tag) in featuresets:
            for (feature, value) in copy(list(feature_dict.items())):
                if (self.features_freqdist[((feature, value), tag)]
                        < self.feature_cutoff) and feature != 'word':
                    feature_dict.pop(feature)

    def extract_features(self, token):
        features = {}

        hyphen = re.compile("-")
        number = re.compile("\d")
        uppercase = re.compile("[A-Z]")

        # If word is not rare, add it as a feature itself
        if self.word_freqdist[token] >= self.word_cutoff:
            features['word'] = token

        features.update({"suffix-1": token[-1:],
                        "suffix-2": token[-2:],
                         "suffix-3": token[-3:],
                         "suffix-4": token[-4:]})
        # Suffix features
        features.update({"prefix-1": token[:1],
                         "prefix-2": token[:2],
                         "prefix-3": token[:3],
                         "prefix-4": token[:4]})
        # Contains uppercase letter
        features['contains-uppercase'] = uppercase.search(token) != None
        # Contains hyphen
        features['contains-hyphen'] = hyphen.search(token) != None
        # Is all in uppercase
        features['is-all-uppercase'] = token.isupper()
        # Contains number
        features['contains-number'] = number.search(token) != None

        return features

    def tag(self, unlabelled_sequence):
        """
        Tags the given unlabelled sentence with parts of speech.
        Uses the Viterbi algorithm with dynamic programming.
        """
        token_count = len(unlabelled_sequence)
        state_count = len(self._states)
        # Create the lattice
        lattice = np.zeros((token_count, state_count), np.float64)
        # Create the backtracking pointers
        backtrack_pointer = {}

        # Initialize the first row of the lattice with starting probabilities
        symbol = unlabelled_sequence[0]
        featureset = self.extract_features(symbol)
        maxent_tags_probdist = self.maxentclassifier.prob_classify(featureset)
        for i, state in enumerate(self._states):
            # By probability chain rule, we multiply the starting probability
            # with the emission probability of this token per tag
            # (addition in log-space)

            lattice[0, i] = self._starting_matrix.logprob(state)

            # If word exists, then use the emission probability
            if self.word_freqdist[symbol] > 0:
                lattice[0, i] += self._outputs_matrix[state].logprob(symbol)
            # Else, use the log probability of the maximum entropy model
            else:
                lattice[0, i] += maxent_tags_probdist.logprob(state)

            backtrack_pointer[0, state] = None

        # Initialize the subsequent rows of the lattice with transition+emission
        for t in range(1, token_count):
            symbol = unlabelled_sequence[t]
            featureset = self.extract_features(symbol)
            maxent_tags_probdist = self.maxentclassifier.prob_classify(
                featureset)
            # Iterate through each state for this word in time
            for j in range(state_count):
                state_j = self._states[j]
                # Keeps track of best path.
                # Best state is for backtracking purposes.
                best_path = None
                best_prevstate = None
                # Iterate through each previous state
                for i in range(state_count):
                    state_i = self._states[i]
                    path = lattice[t-1, i] \
                        + self._transitions_matrix[state_i].logprob(state_j)
                    if not best_path or path > best_path:
                        best_path = path
                        best_prevstate = state_i
                # The best path shall be considered for this state+word pair
                lattice[t, j] = best_path
                # If word exists, use HMM logprob for word given state
                if self.word_freqdist[symbol] > 0:
                    lattice[t,
                            j] += self._outputs_matrix[state_j].logprob(symbol)
                # Else use maxent logprob
                else:
                    lattice[t, j] += maxent_tags_probdist.logprob(state)

                backtrack_pointer[t, state_j] = best_prevstate

        # At this point, the whole trellis lattice is filled.
        # Find the highest probability among the final cells of the lattice.
        best_lastvalue = None
        best_laststate = None
        for i in range(state_count):
            lattice_value = lattice[token_count - 1, i]
            if not best_lastvalue or lattice_value > best_lastvalue:
                best_lastvalue = lattice_value
                best_laststate = self._states[i]
        tags = [best_laststate]
        # Backtrack using the pointer from the best last state
        current_pointer = best_laststate
        for t in range(token_count - 1, 0, -1):
            best_prevstate = backtrack_pointer[t, current_pointer]
            tags.append(best_prevstate)
            current_pointer = best_prevstate
        # Reverse the tags
        tags.reverse()
        return zip(unlabelled_sequence, tags)
