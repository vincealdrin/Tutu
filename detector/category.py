import newspaper
from newspaper.nlp import summarize, keywords
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
import json
import time
from datetime import datetime
import re
import langdetect
from random import randrange
from urllib.parse import urldefrag, urlparse
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from dotenv import load_dotenv, find_dotenv
from db import get_locations, get_provinces, get_one, insert_article, insert_log, get_uuid, get_rand_sources, get_sources
from utils import PH_TIMEZONE, search_locations, search_authors, get_publish_date, sleep, get_popularity, get_proxy
from aylien import categorize, get_rate_limits
from nlp import get_entities, summarize2
from nlp.keywords import parse_topics
from fake_useragent import UserAgent
import rethinkdb as r
import re
from random import shuffle
import os

real_df = pd.read_json('./data/real_news.json')
real_df['reliable'] = 1
fake_df = pd.read_json('./data/fake_news.json')[:653]
fake_df['reliable'] = 0
fake_df = fake_df.drop(['timestamp', 'id', 'url'], axis=1)
print(real_df.shape)
print(fake_df.shape)
df = pd.concat([real_df, fake_df])
df['bodyLength'] = df['body'].apply(lambda body: len(body.split()))
other_df = df.drop(
    [
        'reliable',
        'body',
        'title',
        'hasTopImage',
        'socialScore',
        'sentiment',
        # 'sourceSocialScore',
        'bodyLength',
        # 'sourceHasContactPage',
        # 'sourceHasAboutPage',
        'sourceCountryRank',
        # 'sourceWorldRank',
    ],
    axis=1)
print(other_df.columns.values)
X_body = df.body.values
y = df.reliable.values

X_title = df.title.values

STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)

tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.90,
    min_df=0.01)

X_body_tfidf = tfidf.fit_transform(X_body)

title_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.90,
    min_df=0.01)
X_title_tfidf = title_tfidf.fit_transform(X_title)

x = hstack([X_title_tfidf, X_body_tfidf, other_df], format='csr')
x_source = other_df
x_content = hstack([X_title_tfidf, X_body_tfidf], format='csr')

lr_clf = LogisticRegression(penalty='l1')
lr_clf.fit(x, y)

lr_source_clf = LogisticRegression(penalty='l1')
lr_source_clf.fit(x_source, y)

lr_content_clf = LogisticRegression(penalty='l1')
lr_content_clf.fit(x_content, y)

