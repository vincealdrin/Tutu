from db import get_articles
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import SGDClassifier
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

lr_clf = LogisticRegression(penalty='l1')
lr_clf.fit(X_train, y_train)
lr_pred = lr_clf.predict(X_test)
print('Logistic Regression')
print('Classification Report')
print(classification_report(y_test, lr_pred, target_names=target_names))

print('Accuracy: ' + str(accuracy_score(y_test, lr_pred)))
cv_scores = cross_val_score(lr_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, lr_pred))

nb_clf = MultinomialNB()
nb_clf.fit(X_train, y_train)
lr_pred = nb_clf.predict(X_test)
print('\nNaive Bayes')
print('Classification Report')
print(classification_report(y_test, lr_pred, target_names=target_names))

print('Accuracy: ' + str(accuracy_score(y_test, lr_pred)))
cv_scores = cross_val_score(lr_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, lr_pred))

svm_clf = SGDClassifier(loss='hinge', penalty='l2', alpha=1e-3, random_state=42, max_iter=5, tol=None)
svm_clf.fit(X_train, y_train)
lr_pred = svm_clf.predict(X_test)
print('\nSupport Vector Machine')
print('Classification Report')
print(classification_report(y_test, lr_pred, target_names=target_names))

print('Accuracy: ' + str(accuracy_score(y_test, lr_pred)))
cv_scores = cross_val_score(lr_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, lr_pred))
