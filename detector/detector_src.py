from db import get_articles, get_sources
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
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
    # 'social_score': src['socialScore'],
    # 'wot_reputation': src['wotReputation'],
    'credible': src['isReliable']
})

src_df = pd.DataFrame.from_records(sources)

# src_df['credible'] = src_df['credible'].apply(lambda credible: 1 if credible else 0)
src_df['world_rank'] = src_df['world_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)
src_df['country_rank'] = src_df['country_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)

y = src_df.credible.values
src_df.drop(['credible'], axis=1, inplace=True)
# x = hstack([src_df, body, title], format='csr')

X_train, X_test, y_train, y_test = train_test_split(
    src_df.values, y, test_size=0.20, random_state=42)

target_names = ['not credible', 'credible']

rf_clf = RandomForestClassifier(n_estimators=5)
rf_clf.fit(X_train, y_train)
pred = rf_clf.predict(X_test)
print('Random Forest')
print('Classification Report')
print(classification_report(y_test, pred, target_names=target_names))
print(rf_clf.classes_)
print('Accuracy: ' + str(accuracy_score(y_test, pred)))
cv_scores = cross_val_score(rf_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, pred))

lr_clf = LogisticRegression(penalty='l1')
lr_clf.fit(X_train, y_train)
pred = lr_clf.predict(X_test)
print('\nLogistic Regression')
print('Classification Report')
print(classification_report(y_test, pred, target_names=target_names))

print('Accuracy: ' + str(accuracy_score(y_test, pred)))
cv_scores = cross_val_score(rf_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, pred))

knn_clf = KNeighborsClassifier(n_neighbors=3)
knn_clf.fit(X_train, y_train)
pred = knn_clf.predict(X_test)
print('\nK-Nearest Neighbors')
print('Classification Report')
print(classification_report(y_test, pred, target_names=target_names))

print('Accuracy: ' + str(accuracy_score(y_test, pred)))
cv_scores = cross_val_score(rf_clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(), cv_scores.std() * 2))

print(confusion_matrix(y_test, pred))
