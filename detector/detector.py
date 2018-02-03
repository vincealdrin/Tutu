from db import get_articles, get_sources_sample
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
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

def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    Normalization can be applied by setting `normalize=True`.
    """
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    print(cm)

    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')

articles = get_articles(lambda join: {
    'body': join['left']['body'],
    'title': join['left']['title'],
    # 'src_social_score': join['right']['socialScore'],
    # 'src_has_impt_pages': r.branch(
    #     join['right']['contactUsUrl'],
    #     1,
    #     join['right']['aboutUsUrl'],
    #     1,
    #     0
    # ),
    'src_has_about': 1 if join['right']['aboutUsUrl'] else 0,
    'src_has_contact': 1 if join['right']['contactUsUrl'] else 0,
    # 'src_wot_reputation': join['right']['wotReputation'],
    'src_country_rank': join['right']['countryRank'],
    'src_world_rank': join['right']['worldRank'],
    'src_id': join['right']['id'],
    'credible': join['right']['isReliable']
})
train_sources = get_sources_sample(10)

train_articles = [a for a in articles if a['src_id'] not in train_sources]

print('train articles: ' + str(len(train_articles)))

test_articles = [a for a in articles if a['src_id'] in train_sources]
# print('test sources: '+str(len(train_sources)))
print('test articles: ' + str(len(test_articles)))

df = pd.DataFrame.from_records(train_articles)

print(df.head())

df['credible'] = df['credible'].apply(lambda credible: 1 if credible else 0)
df['src_world_rank'] = df['src_world_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)
df['src_country_rank'] = df['src_country_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)

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

y_train = df.credible.values
df.drop(['src_id', 'body', 'title', 'credible'], axis=1, inplace=True)
X_train = hstack([df, body, title], format='csr')

test_df = pd.DataFrame.from_records(test_articles)

test_df['credible'] = test_df['credible'].apply(lambda credible: 1 if credible else 0)
test_df['src_world_rank'] = test_df['src_world_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)
test_df['src_country_rank'] = test_df['src_country_rank'].apply(lambda rank: 999999999 if rank == 0 else rank)

y_test = test_df.credible.values

test_body = body_tfidf.transform(test_df['body'])
test_title = title_tfidf.transform(test_df['title'])

print(df.head())
test_df.drop(['src_id', 'body', 'title', 'credible'], axis=1, inplace=True)

X_test = hstack([test_df, test_body, test_title], format='csr')
# X_train, X_test, y_train, y_test = train_test_split(
#     x, y, test_size=0.20, random_state=123)

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

cnf_matrix = confusion_matrix(y_test, lr_pred)
np.set_printoptions(precision=2)

fpr, tpr, _ = roc_curve(y_test, lr_clf.predict_proba(X_test)[:, 1])
auc = auc(fpr, tpr)

plt.title('Receiver Operating Characteristic')
plt.plot(fpr, tpr, 'b', label = 'AUC = %0.2f' % auc)
plt.legend(loc = 'lower right')
plt.plot([0, 1], [0, 1],'r--')
plt.xlim([0, 1])
plt.ylim([0, 1])
plt.ylabel('True Positive Rate')
plt.xlabel('False Positive Rate')

# Plot non-normalized confusion matrix
plt.figure()
plot_confusion_matrix(cnf_matrix, classes=target_names,
                      title='Confusion matrix, without normalization')

# Plot normalized confusion matrix
plt.figure()
plot_confusion_matrix(cnf_matrix, classes=target_names, normalize=True,
                      title='Normalized confusion matrix')

plt.show()

# nb_clf = MultinomialNB(fit_prior=False)
# nb_clf.fit(X_train, y_train)
# nb_pred = nb_clf.predict(X_test)
# print('Naive Bayes: ' + str(accuracy_score(y_test, nb_pred)))
# print(classification_report(y_test, nb_pred, target_names=['not credible', 'credible']))

