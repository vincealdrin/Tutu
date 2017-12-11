from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import GaussianNB
# from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, accuracy_score , recall_score , precision_score
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
import json
import pandas as pd
from scipy.sparse import hstack
import numpy as np

real_df = pd.read_csv('./data/real-news.csv')[:-8]
fake_df = pd.read_csv('./data/fake-news.csv')
print(real_df.shape)
print(fake_df.shape)

df = pd.concat([real_df, fake_df], ignore_index=True)
new_df = df[[
  'has_author',
  'has_site_description',
  'has_about_page',
  'has_contact_page',
  'has_alexa_category',
  'is_categorized_by_alexa',
  'site_spd_median_load_time',
  'site_spd_percentile',
  'site_rank',
  'site_ph_rank',
  'site_links_in_count',
  'reliable'
  ]]

X_text = df.text.values
y = df.reliable.values

X_title = df.title.values

tfidf = TfidfVectorizer(stop_words=ENGLISH_STOP_WORDS, ngram_range=(1, 2), max_df = 0.85, min_df = 0.01)

X_text_tfidf = tfidf.fit_transform(X_text)
feature_names = tfidf.get_feature_names()
# show top 10
indices = np.argsort(tfidf.idf_)[::-1]
top_n = 10
top_features = [feature_names[i] for i in indices[:top_n]]
print (top_features)

title_tfidf = TfidfVectorizer(stop_words=ENGLISH_STOP_WORDS, ngram_range=(1, 2), max_df= 0.85, min_df = 0.01)
X_title_tfidf = title_tfidf.fit_transform(X_title)
title_feature_names = title_tfidf.get_feature_names()
# show top 10
indices = np.argsort(title_tfidf.idf_)[::-1]
top_n = 10
title_top_features = [title_feature_names[i] for i in indices[:top_n]]
print (title_top_features)

f = hstack([X_text_tfidf, X_title_tfidf, new_df], format='csr')

X_text_tfidf_train, X_text_tfidf_test, y_text_train, y_text_test = train_test_split(f, y, test_size = 0.2, random_state=1234)

lr_text = LogisticRegression(penalty='l1')
lr_text.fit(X_text_tfidf_train, y_text_train)
y_text_pred = lr_text.predict(X_text_tfidf_test)



# print('\nLinear Regression:')
# print('F1 score {:.4}%'.format( f1_score(y_text_test, y_text_pred, average='macro')*100 ))
# print('Accuracy score {:.4}%'.format(accuracy_score(y_text_test, y_text_pred)*100))
# cros_val_list = cross_val_score(lr_text, X_text_tfidf,y,cv=7)
# print(cros_val_list)
# print(cros_val_list.mean())
