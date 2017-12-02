from nltk.tag.stanford import CoreNLPNERTagger
from nltk.tokenize.stanford import CoreNLPTokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from itertools import groupby

# start CoreNLP server first
# java -mx4g -cp "*" --add-modules java.xml.bind edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 15000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly

non_org = ['Purok']
non_person = ['Brgy']
def get_entities(text):
    sttok = CoreNLPTokenizer('http://localhost:9000')
    stner = CoreNLPNERTagger('http://localhost:9000')

    tokenized_text = sttok.tokenize(text)
    tagged_text = stner.tag(tokenized_text)
    people = []
    organizations = []

    for tag, chunk in groupby(tagged_text, lambda x:x[1]):
        if tag == 'ORGANIZATION':
            organization = " ".join(w for w, t in chunk)

            if not any(no in organization for no in non_org):
                organizations.append(organization)

        if tag == 'PERSON':
            person = " ".join(w for w, t in chunk)

            if not any(np in person for np in non_person) and len(person.split(' ')) != 1:
                people.append(person)

    return set(organizations), set(people)

LANGUAGE = 'english'
SENTENCES_COUNT = 5

stemmer = Stemmer(LANGUAGE)
summarizer = Summarizer(stemmer)
summarizer.stop_words = get_stop_words(LANGUAGE)

def summarize(text):
    summary_sentences = []
    document = PlaintextParser.from_string(text, Tokenizer(LANGUAGE)).document

    for summary in summarizer(document, SENTENCES_COUNT):
        summary_sentences.append(str(summary))

    return summary_sentences
