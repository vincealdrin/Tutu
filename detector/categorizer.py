from db import get_articles_filtered
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import confusion_matrix, classification_report, auc, roc_curve, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline, FeatureUnion
from nltk.stem.snowball import SnowballStemmer
from sklearn.model_selection import cross_val_score
from scipy.sparse import hstack
import pandas as pd
import numpy as np
from item_selector import ItemSelector
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import SGDClassifier
import matplotlib.pyplot as plt
import itertools


articles = get_articles_filtered(lambda join: {
    'body': join['left']['body'],
    'title': join['left']['title'],
    'category': join['left']['categories'].nth(0).get_field('label')
}, 0.045)
print(len(articles))

articles = [a for a in articles if a['category'] != 'Culture' and a['category'] != 'Nation']

print(len(articles))
title_tfidf = TfidfVectorizer(
    stop_words=ENGLISH_STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.85,
    min_df=0.01)

df = pd.DataFrame.from_records(articles)


# df = pd.concat([
#     df[df['category'] == 'Business & Finance'],
#     df[df['category'] == 'Lifestyle'],
#     df[df['category'] == 'Disaster & Accident'],
#     df[df['category'] == 'Entertainment & Arts'],
#     df[df['category'] == 'Sports'],
#     df[df['category'] == 'Law & Government'],
#     df[df['category'] == 'Politics'],
#     df[df['category'] == 'Health'],
#     df[df['category'] == 'Crime'],
#     df[df['category'] == 'Culture'],
#     df[df['category'] == 'Economy'],
#     df[df['category'] == 'Weather'],
#     df[df['category'] == 'Environment'],
#     df[df['category'] == 'Science & Technology'],
# ])

X_train, X_test, y_train, y_test = train_test_split(
    df.body.values, df.category.values, test_size=0.15, random_state=42)

clf = Pipeline([
    ('tfidf',
     TfidfVectorizer(
         stop_words=ENGLISH_STOP_WORDS,
         ngram_range=(1, 2),
         max_df=0.85,
         min_df=0.01)),
    ('clf', LogisticRegression(penalty='l1', class_weight='balanced')),
])

clf.fit(X_train, y_train)

pred = clf.predict(X_test)

print('Logistic Regression')
print('Classification Report')
print(classification_report(y_test, pred, target_names=clf.classes_))

print('Accuracy: ' + str(accuracy_score(y_test, pred)))
cv_scores = cross_val_score(clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(),
                                               cv_scores.std() * 2))

cnf_matrix = confusion_matrix(y_test, pred)

print('\n MultinomialNB')
clf = Pipeline([
    ('tfidf',
     TfidfVectorizer(
         stop_words=ENGLISH_STOP_WORDS,
         ngram_range=(1, 2),
         max_df=0.85,
         min_df=0.01)),
    ('clf', MultinomialNB(fit_prior=False)),
])

clf.fit(X_train, y_train)

pred = clf.predict(X_test)

print('Logistic Regression')
print('Classification Report')
print(classification_report(y_test, pred, target_names=clf.classes_))

print('Accuracy: ' + str(accuracy_score(y_test, pred)))
cv_scores = cross_val_score(clf, X_train, y_train, cv=5)
print("Cross Validation: %0.2f (+/- %0.2f)" % (cv_scores.mean(),
                                               cv_scores.std() * 2))

cnf_matrix = confusion_matrix(y_test, pred)

