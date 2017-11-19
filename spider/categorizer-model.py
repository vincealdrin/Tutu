import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import re
import string
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer, TfidfTransformer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier


def clean_text(s):
    s = s.lower()
    for ch in string.punctuation:
        s = s.replace(ch, " ")
    s = re.sub("[0-9]+", "||DIG||", s)
    s = re.sub(' +',' ', s)
    return s

np.random.seed(123456)

dataset = pd.read_csv("./uci-news-aggregator.csv")
a = pd.read_json('./sports-articles-34401055-d72d-43e1-9d10-1861878bfce2/articles.json')
b = pd.read_json('./sports-articles-704c69fa-48e1-4e68-8c8d-986f4428733e/articles.json')
c = pd.concat([a, b])
c.rename(columns={'title':'TITLE'}, inplace=True)
c['CATEGORY'] = 's'
print(c.columns)
dataset = pd.concat([c, dataset])
z = dataset.query('CATEGORY==\'s\'')

dataset['CATEGORY'].value_counts().plot(kind="bar")

dataset['TEXT'] = [clean_text(s) for s in dataset['TITLE']]

# pull the data into vectors
vectorizer = CountVectorizer()
x = vectorizer.fit_transform(dataset['TEXT'])

# for Tfidf (we have tried and the results aren't better)
#tfidf = TfidfVectorizer()
#x = tfidf.fit_transform(dataset['TEXT'].values)

encoder = LabelEncoder()
y = encoder.fit_transform(dataset['CATEGORY'])

# split into train and test sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2)

nb = MultinomialNB()
nb.fit(x_train, y_train)

results_nb_cv = cross_val_score(nb, x_train, y_train, cv=10)
print(results_nb_cv.mean())
print(nb.score(x_test, y_test))

x_test_pred = nb.predict(x_test)
print(confusion_matrix(y_test, x_test_pred))

print(classification_report(y_test, x_test_pred, target_names=encoder.classes_))


def predict_cat(title):
    cat_names = {'b' : 'business', 't' : 'science and technology', 'e' : 'entertainment', 'm' : 'health'}
    cod = nb.predict(vectorizer.transform([title]))

    return cat_names[encoder.inverse_transform(cod)[0]]

print(predict_cat('''economy is going up'''))