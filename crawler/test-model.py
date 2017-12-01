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

real_df = pd.read_csv('./real-news.csv')[:-8]
fake_df = pd.read_csv('./fake-news.csv')
print(real_df.shape)
print(fake_df.shape)

df = pd.concat([real_df, fake_df], ignore_index=True)
# df = df[[
#   'has_author',
#   'has_site_description',
#   'has_about_page',
#   'has_contact_page',
#   'has_alexa_category',
#   'is_categorized_by_alexa',
#   'site_spd_median_load_time',
#   'site_spd_percentile',
#   'site_rank',
#   'site_ph_rank',
#   'site_links_in_count',
#   'reliable'
#   ]]



X_text = df.text.values
y = df.reliable.values

tfidf = TfidfVectorizer(stop_words=ENGLISH_STOP_WORDS,ngram_range=(1,2),max_df= 0.85, min_df= 0.01)

X_text_tfidf = tfidf.fit_transform(X_text)
# X_title_tfidf = tfidf.fit_transform(X_title)

X_text_tfidf_train, X_text_tfidf_test, y_text_train, y_text_test = train_test_split(X_text_tfidf, y, test_size = 0.2, random_state=1234)
# X_title_tfidf_train, X_title_tfidf_test, y_title_train, y_title_test = train_test_split(X_title_tfidf, y, test_size = 0.2, random_state=1234)

# predict using title of the article
# lr_title = LogisticRegression(penalty='l1')
# lr_title.fit(X_title_tfidf_train, y_title_train)
# y_title_pred = lr_title.predict(X_text_tfidf_test)

# print('F1 score {:.4}%'.format( f1_score(y_title_test, y_title_pred, average='macro')*100 ))
# print('Accuracy score {:.4}%'.format(accuracy_score(y_title_test, y_title_pred)*100))

# predict using title of the article
lr_text = LogisticRegression(penalty='l1')
lr_text.fit(X_text_tfidf_train, y_text_train)
y_text_pred = lr_text.predict(X_text_tfidf_test)
print('\nLinear Regression:')
print('F1 score {:.4}%'.format( f1_score(y_text_test, y_text_pred, average='macro')*100 ))
print('Accuracy score {:.4}%'.format(accuracy_score(y_text_test, y_text_pred)*100))
cros_val_list = cross_val_score(lr_text, X_text_tfidf,y,cv=7)
print(cros_val_list)
print(cros_val_list.mean())
# predict using text of the article
rcf = RandomForestClassifier(n_estimators=200, n_jobs=-1)
rcf.fit(X_text_tfidf_train, y_text_train)
y_rcf_text_pred = rcf.predict(X_text_tfidf_train)
print('\nRandom Forest:')
print('F1 score {:.4}%'.format( f1_score(y_text_test, y_rcf_text_pred, average='macro')*100 ))
print('Accuracy score {:.4}%'.format(accuracy_score(y_text_test, y_rcf_text_pred)*100))

print('\nStochastic Gradient Descent:')
sgd = SGDClassifier(loss='log', penalty='l1', max_iter=5, tol=None)
sgd.fit(X_text_tfidf_train, y_text_train)

y_sgd_text_pred = sgd.predict(X_text_tfidf_train)

# print(y_sgd_text_pred)
print('F1 score {:.4}%'.format( f1_score(y_text_test, y_sgd_text_pred, average='macro')*100 ))
print('Accuracy score {:.4}%'.format(accuracy_score(y_text_test, y_sgd_text_pred)*100))
