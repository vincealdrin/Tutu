import nltk, re
import os.path
import requests
from nltk import *
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
from difflib import SequenceMatcher

class TopicDetector(object):
    def tokenize_sent(self, words):
        data = sent_tokenize(words)
        content = [word_tokenize(sent) for sent in data]
        return content

    def grammar(self):
        grammar = r"""
                        NOUNS:
                            {<NN>}
                            {<NNS>}
                            {<NN>+<NN>}
                            {<NNI>+<NN>}
                            {<JJ>+<NN>}
                            {<NNP>+<NNP>}
                            {<NNP>}
                            {<NNPS>}
                        """
        content = RegexpParser(grammar)
        return content

    def get_data(self, words):
        sents = word_tokenize(words)
        content1 = pos_tag(sents)
        content = self.grammar().parse(content1)
        return content

    def leaves(self, tree):
        tree = self.get_data(tree)
        for subtree in tree.subtrees(filter=lambda ts: ts.label() == 'NOUNS'):
            yield subtree.leaves()

    def get_set(self, tree):
        for l in self.leaves(tree):
            term = [w for w, t in l]
            yield term

    def improve_data(self, words):
        terms = self.get_set(words)
        keywords = []
        for term in terms:
            for word in term:
                keywords.append(word)
        keywords = ' '.join(keywords)
        sents = self.tokenize_sent(keywords)
        sents = [pos_tag(sent) for sent in sents]
        data = []
        for tagged in sents:
            for chunk in ne_chunk(tagged):
                if type(chunk) == Tree:
                    data.append(' '.join([c[0] for c in chunk]))
        return data

    def most_common(self, words):
        data = word_tokenize(words)
        content = [word for word in data if word not in stopwords.words('english')]
        freq = FreqDist(content)
        return freq

    def extract_topics(self, words):
        freq = self.most_common(words)
        data = self.improve_data(words)
        top10 = [w for w, c in FreqDist(data).most_common(10)]
        topics = [e for e in top10 if e.split()[0] in freq]
        topics = self.readable(topics)
        return topics

    def main_topics(self, words):
        data = self.most_common(words)
        freq = [w for w, c in data.most_common(10)
                if pos_tag([w])[0][1] in "NNP"]
        et = word_tokenize(self.extract_topics(words))
        main_topics = set([e for e in et if e.split()[0] in freq])
        main_topics = self.readable(main_topics)
        return main_topics

    def readable(self, words):
        data = ','.join(words)
        return data

def parse_topics(text):
    td = TopicDetector()

    return {
        'common': td.extract_topics(text),
        'main': td.main_topics(text)
    }
