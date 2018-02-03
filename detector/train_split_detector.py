from db import get_articles, get_sources
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from nltk.stem.snowball import SnowballStemmer
from scipy.sparse import hstack
import pandas as pd
import rethinkdb as r
import re
import pickle

# content detector

articles = get_articles(lambda join: {
    'body': join['left']['body'],
    'title': join['left']['title'],
    'credible': join['right']['isReliable']
})

df = pd.DataFrame.from_records(articles)

with open('./tl_stopwords.txt', 'r') as f:
    TL_STOPWORDS = f.read().splitlines()

STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)

body_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.85,
    min_df=0.01)

title_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.85,
    min_df=0.01)

body = body_tfidf.fit_transform(df.body.values)
title = title_tfidf.fit_transform(df.title.values)

y = df.credible.values
df.drop(['body', 'title', 'credible'], axis=1, inplace=True)
x = hstack([body, title], format='csr')

X_train, X_test, y_train, y_test = train_test_split(
    x, y, test_size=0.20, random_state=123)

target_names = ['not credible', 'credible']

lr_clf = MultinomialNB()
lr_clf.fit(X_train, y_train)

# source detector

sources = get_sources(lambda src: {
    'has_about': r.branch(
        src['aboutUsUrl'],
        1,
        0
    ),
    'has_contact': r.branch(
        src['contactUsUrl'],
        1,
        0
    ),
    'country_rank': src['countryRank'],
    'world_rank': src['worldRank'],
    'social_score': src['socialScore'],
    # 'wot_reputation': src['wotReputation'],
    'credible': src['isReliable']
})

src_df = pd.DataFrame.from_records(sources)

src_df['credible'] = src_df['credible'].apply(lambda credible: 1 if credible else 0)
src_df['world_rank'] = src_df['world_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)
src_df['country_rank'] = src_df['country_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)

y = src_df.credible.values
src_df.drop(['credible'], axis=1, inplace=True)

X_train, X_test, y_train, y_test = train_test_split(
    src_df.values, y, test_size=0.20, random_state=123)

target_names = ['not credible', 'credible']

rf_clf = KNeighborsClassifier(n_neighbors=3)
rf_clf.fit(X_train, y_train)

# pickle

with open('detector_content_clf.pkl', 'wb') as f:
    pickle.dump(lr_clf, f)
with open('detector_src_clf.pkl', 'wb') as f:
    pickle.dump(rf_clf, f)
with open('detector_content_body_tfidf.pkl', 'wb') as f:
    pickle.dump(body_tfidf, f)
with open('detector_content_title_tfidf.pkl', 'wb') as f:
    pickle.dump(title_tfidf, f)
