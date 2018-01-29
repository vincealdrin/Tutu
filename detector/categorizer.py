from db import get_articles
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from nltk.stem.snowball import SnowballStemmer
import pandas as pd
import pickle

articles = get_articles(lambda join: {
    'body': join['left']['body'],
    'title': join['left']['title'],
    'category': join['left']['categories'].nth(0).get_field('label')
})[:-9]
print(len(articles))

title_tfidf = TfidfVectorizer(
    stop_words=ENGLISH_STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.85,
    min_df=0.01)

df = pd.DataFrame.from_records(articles)

df = pd.concat([
    df[df['category'] == 'Business & Finance'],
    df[df['category'] == 'Lifestyle'],
    df[df['category'] == 'Disaster & Accident'],
    df[df['category'] == 'Entertainment & Arts'],
    df[df['category'] == 'Sports'],
    df[df['category'] == 'Law & Government'],
    df[df['category'] == 'Politics'],
    df[df['category'] == 'Health'],
    df[df['category'] == 'Crime'],
    df[df['category'] == 'Culture'],
    df[df['category'] == 'Economy'],
    df[df['category'] == 'Weather'],
    df[df['category'] == 'Environment'],
    df[df['category'] == 'Science & Technology'],
])


X_train, X_test, y_train, y_test = train_test_split(
    df.body.values, df.category.values, test_size=0.20, random_state=123)

text_clf = Pipeline([
    ('tfidf',
     TfidfVectorizer(
         stop_words=ENGLISH_STOP_WORDS,
         ngram_range=(1, 2),
         max_df=0.85,
         min_df=0.01)),
    ('clf', MultinomialNB(fit_prior=False)),
])

text_clf.fit(X_train, y_train)

with open('categorizer.pkl', 'wb') as f:
  pickle.dump(text_clf, f)

prediction = text_clf.predict(X_test)

counter = 0

for i in range(len(prediction)):
    if prediction[i] != y_test[i]:
        counter = counter + 1

print(counter)
print(accuracy_score(y_test, prediction))
