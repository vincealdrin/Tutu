from functools import reduce
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from newspaper import Article
import os
from fake_useragent import UserAgent
import pandas as pd
from requests import get
from lxml import etree
from scipy.sparse import hstack
from flask import Flask, request, jsonify
from urllib.parse import urlparse
import numpy as np
import pickle

SHARED_COUNT_API_KEY = os.environ.get('SHARED_COUNT_API_KEY')
PROXY_IP = os.environ.get('PROXY_IP')
PROXY_IP2 = os.environ.get('PROXY_IP2')
PROXY_IP3 = os.environ.get('PROXY_IP3')
AYLIEN_APP_ID4 = os.environ.get('AYLIEN_APP_ID4')
AYLIEN_APP_KEY4 = os.environ.get('AYLIEN_APP_KEY4')

proxies = [PROXY_IP, PROXY_IP2, PROXY_IP3]

clf = pickle.load(open('detector_clf.pkl', 'rb'))
body_tfidf = pickle.load(open('detector_body_tfidf.pkl', 'rb'))
title_tfidf = pickle.load(open('detector_title_tfidf.pkl', 'rb'))

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

@app.route('/predict', methods=['POST'])
def predict():
    info = request.json

    a = Article('')
    a.set_html(info['body'])
    a.parse()

    # if len(a.text.split()) < 20:
    #     return 'Please enter a valid article url from the source', 400

    xml_str = get('http://data.alexa.com/data?cli=10&url=' + info['url'])
    tree = etree.fromstring(xml_str.text.encode('utf-8'))
    etree.strip_tags(tree, etree.Comment)

    world_rank = 0
    country_rank = 0
    domain = info['url'].replace(urlparse(info['url']).path, '')
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
    src_social_score = get_popularity(domain)

    print({
        # 'src_social_score': src_social_score,
        # 'src_has_impt_pages': 1 if info['sourceHasAboutPage'] or info['sourceHasContactPage'] else 0,
        # 'src_wot_reputation': info['wotReputation'],
        'src_has_about': 1 if info['sourceHasAboutPage'] else 0,
        'src_has_contact': 1 if info['sourceHasContactPage'] else 0,
        'src_country_rank':  999999999 if country_rank == 0 else country_rank,
        'src_world_rank': 999999999 if world_rank == 0 else world_rank,
    })
    test_df = pd.DataFrame(
        {
            'body': body,
            'title': a.title,
            # 'src_social_score': src_social_score,
            # 'src_has_impt_pages': 1 if info['sourceHasAboutPage'] or info['sourceHasContactPage'] else 0,
            'src_has_about': 1 if info['sourceHasAboutPage'] else 0,
            'src_has_contact': 1 if info['sourceHasContactPage'] else 0,
            # 'src_wot_reputation': info['wotReputation'],
            'src_country_rank':  999999999 if country_rank == 0 else country_rank,
            'src_world_rank': 999999999 if world_rank == 0 else world_rank,
        },
        index=[0])

    body = body_tfidf.transform(test_df.body.values)
    title = title_tfidf.transform(test_df.title.values)

    # print(zip(body_tfidf.get_feature_names(), body_tfidf.idf_))
    # print(body)
    # print(np.sum(body))

    test_df.drop(['body', 'title'], axis=1, inplace=True)
    test = hstack([test_df, body, title], format='csr')

    pred = clf.predict(test)[0]
    proba = clf.predict_proba(test)[0][1]
    print(clf.classes_)
    print(clf.predict_proba(test)[0])
    print(pred)
    print(proba)

    return jsonify({
        'isCredible': bool(pred),
        'pct': proba * 100,
        'sourceUrl': domain,
        'socialScore': src_social_score,
        'countryRank': country_rank,
        'worldRank': world_rank,
    })


if __name__ == '__main__':
    # clf = joblib.load('model.pkl')
    app.run(port=5001, debug=True)
