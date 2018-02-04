import pickle
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
    'category': join['left']['categories'].nth(0).get_field('label')
}, 0.045)

articles = [
    a for a in articles
    if a['category'] != 'Culture' and a['category'] != 'Nation'
]

df = pd.DataFrame.from_records(articles)

clf = Pipeline([('tfidf',
                 TfidfVectorizer(
                     stop_words=ENGLISH_STOP_WORDS,
                     ngram_range=(1, 2),
                     max_df=0.85,
                     min_df=0.01)), ('clf', LogisticRegression(penalty='l1'))])

clf.fit(df.body.values, df.category.values)

with open('categorizer.pkl', 'wb') as f:
    pickle.dump(clf, f)
