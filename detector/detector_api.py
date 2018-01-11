from functools import reduce
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import f1_score, accuracy_score, recall_score, precision_score
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from scipy.sparse import hstack
from sklearn.externals import joblib
from newspaper import Article
import os
from fake_useragent import UserAgent
from requests import get
from lxml import etree
from flask import Flask, request, jsonify

SHARED_COUNT_API_KEY = os.environ.get('SHARED_COUNT_API_KEY')
PROXY_IP = os.environ.get('PROXY_IP')
PROXY_IP2 = os.environ.get('PROXY_IP2')
PROXY_IP3 = os.environ.get('PROXY_IP3')
AYLIEN_APP_ID4 = os.environ.get('AYLIEN_APP_ID4')
AYLIEN_APP_KEY4 = os.environ.get('AYLIEN_APP_KEY4')

proxies = [PROXY_IP, PROXY_IP2, PROXY_IP3]


def get_reddit_shared_count(url):
    headers = {'User-Agent': UserAgent().random}
    infos = get(
        'https://www.reddit.com/api/info.json?url=' + url,
        headers=headers).json()['data']['children']
    sub_shared_count = len(infos)
    total_score = reduce((lambda x, info: x + info['data']['score']), infos, 0)
    total_num_comments = reduce(
        (lambda x, info: x + info['data']['num_comments']), infos, 0)

    return total_score + sub_shared_count + total_num_comments


def get_popularity(url):
    res = get('https://api.sharedcount.com/v1.0/', {
        'url': 'http://' + url,
        'apikey': SHARED_COUNT_API_KEY
    }).json()
    reddit_total = get_reddit_shared_count(url)
    su_score = res['StumbleUpon'] if res['StumbleUpon'] else 0
    pin_score = res['Pinterest'] if res['Pinterest'] else 0
    li_score = res['LinkedIn'] if res['LinkedIn'] else 0
    fb_score = res['Facebook']['total_count'] if res['Facebook'][
        'total_count'] else 0

    return fb_score + reddit_total + li_score + pin_score + su_score


app = Flask(__name__)

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
other_df = df.drop(
    [
        'reliable',
        'body',
        'title',
        'hasTopImage',
        'socialScore',
        'sentiment',
        # 'sourceSocialScore',
        'bodyLength',
        # 'sourceHasContactPage',
        # 'sourceHasAboutPage',
        'sourceCountryRank',
        # 'sourceWorldRank',
    ],
    axis=1)
print(other_df.columns.values)
X_body = df.body.values
y = df.reliable.values

X_title = df.title.values

STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)

tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    max_df=0.90,
    min_df=0.01)

X_body_tfidf = tfidf.fit_transform(X_body)

title_tfidf = TfidfVectorizer(
    token_pattern=r'(?ui)\b\w*[a-z]{2}\w*\b',
    stop_words=STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.90,
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

lsvc_clf = LinearSVC()
lsvc_clf.fit(x, y)

sgd_clf = SGDClassifier(loss='log')
sgd_clf.fit(x, y)

clf = MultinomialNB()
clf.fit(x, y)


@app.route('/predict', methods=['POST'])
def predict():
    info = request.json

    a = Article('')
    a.set_html(info['body'])
    a.parse()

    sentiment = SentimentIntensityAnalyzer().polarity_scores(a.text)

    if sentiment['compound'] >= 0.5:
        sent_val = 0
    elif sentiment['compound'] <= 0.5:
        sent_val = 1
    else:
        sent_val = 2

    xml_str = get('http://data.alexa.com/data?cli=10&url=' + a.url)
    tree = etree.fromstring(xml_str.text.encode('utf-8'))
    etree.strip_tags(tree, etree.Comment)

    world_rank = 0
    country_rank = 0
    domain = a.url
    for x in tree.xpath('/ALEXA/SD/POPULARITY'):
        world_rank = int(x.get('TEXT')) if x.get('TEXT') else 0
        domain = x.get('URL') if x.get('URL') else ''

    if not domain:
        for z in tree.xpath('/ALEXA/SD'):
            print(z.get('HOST'))
            domain = z.get('HOST') if z.get('HOST') else ''

    for x in tree.xpath('/ALEXA/SD/COUNTRY'):
        country_rank = int(x.get('RANK')) if x.get('RANK') else 0

    body = a.text.replace('ADVERTISEMENT', '').rstrip(r'\n\r')
    source_soc_score = get_popularity(domain)
    print({
        'bodyLength': len(body.split()),
        'sourceHasAboutPage': info['sourceHasAboutPage'],
        'sourceHasContactPage': info['sourceHasContactPage'],
        'sourceSocialScore': source_soc_score,
        'sourceCountryRank': country_rank,
        'sourceWorldRank': world_rank,
    })
    print(domain)
    test = pd.DataFrame(
        {
            'title': a.title,
            'body': body,
            'hasTopImage': 1 if a.top_image else 0,
            'bodyLength': len(body.split()),
            'sourceHasAboutPage': info['sourceHasAboutPage'],
            'sourceHasContactPage': info['sourceHasContactPage'],
            'sentiment': sent_val,
            'sourceSocialScore': source_soc_score,
            'sourceCountryRank': country_rank,
            'sourceWorldRank': world_rank,
        },
        index=[0])
    body_test = test.body.values
    title_test = test.title.values

    test_other = test.drop(
        [
            'title',
            'body',
            'hasTopImage',
            'sentiment',
            # 'sourceSocialScore',
            'bodyLength',
            # 'sourceHasContactPage',
            # 'sourceHasAboutPage',
            'sourceCountryRank',
            # 'sourceWorldRank',
        ],
        axis=1)
    print(test_other.columns.values)
    X_body_test = tfidf.transform(body_test)
    X_title_test = title_tfidf.transform(title_test)

    test_df = hstack([X_title_test, X_body_test, test_other], format='csr')
    test_source_df = test_other
    test_content_df = hstack([X_title_test, X_body_test], format='csr')

    # voting
    nb_pred = clf.predict(test_df)[0]
    lr_pred = lr_clf.predict(test_df)[0]

    lr_proba = lr_clf.predict_proba(test_df)[0]
    lr_source_proba = lr_source_clf.predict_proba(test_source_df)[0]
    lr_content_proba = lr_content_clf.predict_proba(test_content_df)[0]

    knn_pred = knn_clf.predict(test_df)[0]
    lsvc_pred = lsvc_clf.predict(test_df)[0]
    result = nb_pred + lr_pred + knn_pred
    prediction = result > 1

    print('nb')
    print(nb_pred)
    print(clf.predict_proba(test_df))

    print('lr')
    print(lr_pred)
    print(lr_proba)

    print('lsvc')
    print(lsvc_pred)

    print('knn')
    print(knn_pred)
    print(knn_clf.predict_proba(test_df))

    # print('Prediction: ' + 'reliable' if pred else 'not reliable')

    return jsonify({
        'reliable': bool(lr_pred),
        'pct': lr_proba[1] * 100,
        'sourcePct': lr_source_proba[1] * 100,
        'contentPct': lr_content_proba[1] * 100,
        'sourceUrl': domain,
        'socialScore': source_soc_score,
        'countryRank': country_rank,
        'worldRank': world_rank,
    })


if __name__ == '__main__':
    # clf = joblib.load('model.pkl')
    app.run(port=5001, debug=True)
