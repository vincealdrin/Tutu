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

with open('../fake-news-detector/tl_stopwords.txt', 'r') as f:
    TL_STOPWORDS = f.read().splitlines()

real_df = pd.read_json('./data/real_news.json')
real_df['reliable'] = 1
fake_df = pd.read_json('./data/fake_news.json')[:437]
fake_df['reliable'] = 0
fake_df = fake_df.drop(['timestamp', 'sourceSocialScore', 'id', 'url'], axis=1)
df = pd.concat([real_df, fake_df])
other_df = df.drop(['body', 'title', 'hasTopImage', 'reliable'], axis=1)

X_body = df.body.values
y = df.reliable.values

X_title = df.title.values

STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)

le = LabelEncoder()
tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.85,
    min_df=0.01)

X_body_tfidf = tfidf.fit_transform(X_body)
# feature_names = tfidf.get_feature_names()
# show top 10
# indices = np.argsort(tfidf.idf_)[::-1]
# top_n = 100
# top_features = [feature_names[i] for i in indices[:top_n]]
# print(top_features)

title_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.85,
    min_df=0.01)
X_title_tfidf = title_tfidf.fit_transform(X_title)
# title_feature_names = title_tfidf.get_feature_names()
# show top 10
# indices = np.argsort(title_tfidf.idf_)[::-1]
# top_n = 100
# title_top_features = [title_feature_names[i] for i in indices[:top_n]]
# print(title_top_features)
print(other_df.columns.values)

f = hstack([X_body_tfidf, X_title_tfidf, other_df], format='csr')

# X_body_tfidf_train, X_body_tfidf_test, y_body_train, y_body_test = train_test_split(
#     f, y, test_size=0.33, random_state=53)

lr_body = MultinomialNB()
lr_body.fit(f, y)

test = pd.DataFrame(
    {
        "body":
        "Duterte to Anti Martial Law groups: Ilagay mo sila dito sa Mindanao at manirahan, tignan natinBwelta ni Pangulong Rodrigo Duterte sa mga opposition at kontra sa kanyang pag deklara ng martial law sa mindanao upang agarang maresulba ang crisis at terrorestang groupo na pinasimunuan ng Maute Group, ng magpahayag at bumisita ito sa mga WIS soldiers and police officers sa Camp Evangelista, Cagayan De Oro City, noong Hunyo 11, 2017.Ito ang pahayag ng pangulo:“I lost 58 soldiers add it to the number of already [killed in action] tapos ganon lang kasimple ang tingin nila,”“Maybe sila kasi sa luzon okay lang sila eh,” dagdag ng pangulo.“Pero ilagay mo sila dito sa Mindanao..make him establish a residence here in Marawi, and in Zamboanga, Jolo tignan natin.” Duterte said.Pinasaringan din ng pangulo ang ilang membro ng Liberal Party kung saan inaakusahan nila si dating pangulong Arroyo sa pagiging corrupt, pero sila mismo ay mga corrupt rin, during Aquino Administration.Dagdag ng pangulo, “Madali lang kasing magdaldal.. papogi its very easy to criticize but history has shown na yung nag criticize.. yung noong mga Liberal corrupt corrupt si Arroyo ngayon sila oh tignan mo yung six years, edi puro corruption,”Commentscomments",
        "sentiment":
        1,
        "socialScore":
        519,
        "sourceCountryRank":
        49285,
        "sourceHasAboutPage":
        0,
        "sourceHasContactPage":
        1,
        "sourceWorldRank":
        1826083,
        "title":
        "Duterte to Anti Martial Law groups: Ilagay mo sila dito sa Mindanao at manirahan, tignan natin"
    },
    index=[0])

sentiment_test = test.body.values
body_test = test.body.values
title_test = test.title.values

test_other = test.drop(['title', 'body'], axis=1)

X_body_test = tfidf.transform(body_test)
X_title_test = title_tfidf.transform(title_test)

z = hstack([X_body_test, X_title_test, test_other], format='csr')

y_body_pred = lr_body.predict_proba(z)

print(y_body_pred)
joblib.dump(lr_body, 'model.pkl')
