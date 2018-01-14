import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import GaussianNB, MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, accuracy_score, recall_score, precision_score
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import hstack
from sklearn.externals import joblib
import numpy as np

with open('./tl_stopwords.txt', 'r') as f:
    TL_STOPWORDS = f.read().splitlines()

real_df = pd.read_json('./data/real_news.json')
real_df['reliable'] = 1
fake_df = pd.read_json('./data/fake_news.json')[:653]
fake_df['reliable'] = 0
fake_df = fake_df.drop(['timestamp', 'id', 'url'], axis=1)
print(real_df.shape)
print(fake_df.shape)
df = pd.concat([real_df, fake_df])
df['bodyLength'] = df['body'].apply(lambda body: len(body.split()))
# df['sourceHasImptPage'] = np.where((df['sourceHasContactPage'] | df['sourceHasAboutPage']), 1, 0)

other_df = df.drop(
    [
        'reliable',
        'body',
        'title',
        'hasTopImage',
        'socialScore',
        'sentiment',
        'sourceSocialScore',
        'bodyLength',
        'sourceHasContactPage',
        'sourceHasAboutPage',
        # 'sourceCountryRank',
        # 'sourceWorldRank',
    ],
    axis=1)

print(other_df.columns.values)
print(other_df.tail())
X_body = df.body.values
y = df.reliable.values

X_title = df.title.values

STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)

tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.85,
    min_df=0.01)

X_body_tfidf = tfidf.fit_transform(X_body)

title_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.85,
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

knn_clf = KNeighborsClassifier()
knn_clf.fit(x, y)

svc_clf = SVC(probability=True)
svc_clf.fit(x, y)

lsvc_clf = LinearSVC()
lsvc_clf.fit(x, y)

sgd_clf = SGDClassifier(loss='log')
sgd_clf.fit(x, y)

clf = MultinomialNB()
clf.fit(x, y)
# joblib.dump(lr_body, 'model.pkl')
