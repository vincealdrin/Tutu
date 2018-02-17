from db import get_articles, get_sources_sample
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from nltk.stem.snowball import SnowballStemmer
from scipy.sparse import hstack
from sklearn.metrics import confusion_matrix, classification_report, auc, roc_curve
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt
import itertools
import pandas as pd
import rethinkdb as r
import re
import pickle

articles = get_articles(lambda join: {
    'body': join['left']['body'],
    'title': join['left']['title'],
    # 'src_social_score': join['right']['socialScore'],
    # 'src_wot_reputation': join['right']['wotReputation'],
    # 'src_has_impt_pages': r.branch(
    #     join['right']['contactUsUrl'],
    #     1,
    #     join['right']['aboutUsUrl'],
    #     1,
    #     0
    # ),
    'src_has_about': 1 if join['right']['aboutUsUrl'] else 0,
    'src_has_contact': 1 if join['right']['contactUsUrl'] else 0,
    # 'src_country_rank': join['right']['countryRank'],
    'src_world_rank': join['right']['worldRank'],
    'src_domain_has_number': 1 if join['right']['domainHasNumber'] else 0,
    'src_domain_is_blog': 1 if join['right']['isBlogDomain'] else 0,
    'credible': join['right']['isReliable']
})

df = pd.DataFrame.from_records(articles)

df['credible'] = df['credible'].apply(lambda credible: 1 if credible else 0)
df['src_world_rank'] = df['src_world_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)
# df['src_country_rank'] = df['src_country_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)

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

y_train = df.credible.values
df.drop(['body', 'title', 'credible'], axis=1, inplace=True)
X_train = hstack([df, body, title], format='csr')

lr_clf = LogisticRegression(penalty='l1')
lr_clf.fit(X_train, y_train)

with open('detector_title_tfidf.pkl', 'wb') as f:
    pickle.dump(body_tfidf, f)
with open('detector_body_tfidf.pkl', 'wb') as f:
    pickle.dump(title_tfidf, f)
with open('detector_clf.pkl', 'wb') as f:
    pickle.dump(lr_clf, f)
