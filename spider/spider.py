import newspaper
import json
import time
from requests import get
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv, find_dotenv
import os
import langdetect
import sys
from random import randrange
from fake_useragent import UserAgent
import rethinkdb as r
import datetime
from urllib.parse import urldefrag
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from aylienapiclient import textapi
from textblob import TextBlob
import hashlib

load_dotenv(find_dotenv(), override=True)

# get free proxies from us-proxy.org
def get_proxies():
    html_doc = get('https://www.us-proxy.org/').text
    soup = BeautifulSoup(html_doc, 'html.parser')
    rows = soup.find_all('tr')[1:-1]

    http_rows = [row for row in rows if row.select('td[class=\'hx\']')[0].text == 'no']
    http_rand_idx = randrange(0, len(http_rows))
    http_ip = http_rows[http_rand_idx].find_all('td')[0].text
    http_port = http_rows[http_rand_idx].find_all('td')[1].text

    https_rows = [row for row in rows if row.select('td[class=\'hx\']')[0].text == 'yes']
    https_rand_idx = randrange(0, len(https_rows))
    https_ip = https_rows[https_rand_idx].find_all('td')[0].text
    https_port = https_rows[https_rand_idx].find_all('td')[1].text
    proxies = { 'http': http_ip + ':' + http_port, 'https': https_ip + ':' + https_port }
    print('\nProxies: ' + json.dumps(proxies, indent=2))
    sleep()

    return proxies

def sleep():
    slp_time = randrange(2, 6)
    print('\n> ' + str(slp_time) + 's sleep...\n')

    time.sleep(slp_time)

AMAZON_ACCESS_KEY = os.environ.get('AMAZON_ACCESS_KEY')
AMAZON_SECRET_KEY = os.environ.get('AMAZON_SECRET_KEY')
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')
AYLIEN_APP_ID = os.environ.get('AYLIEN_APP_ID')
AYLIEN_APP_KEY = os.environ.get('AYLIEN_APP_KEY')
LANGUAGE = 'english'
SENTENCES_COUNT = 5

stemmer = Stemmer(LANGUAGE)
summarizer = Summarizer(stemmer)
summarizer.stop_words = get_stop_words(LANGUAGE)

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)
locations = r.table('locations').eq_join('province_id', r.table('provinces')).zip().run(conn)
provinces = r.table('provinces').run(conn)
news_sources = list(r.table('sources').run(conn))

text_client = textapi.Client("c5db8a0f", "59ec79539dafd44df50d93cd19b2f947")
classes = [
    'Business', 'Economy', 'Finance',
    'Industries', 'Lifestyle','Entertainment',
    'Sports', 'Government', 'Politics', 'Law',
    'Health', 'Technology', 'Crime', 'Weather',
    'Transportation', 'Nation', 'Regional'
]
count = 0

if not len(news_sources):
    print('EMPTY NEWS SOURCES')

for news_source in news_sources:
    url = news_source['contentData']['dataUrl']
    config = newspaper.Config()
    config.browser_user_agent = UserAgent().random
    config.follow_meta_refresh = True
    # config.proxies = get_proxies()

    try:
        source = newspaper.build('http://'+url, config=config, memoize_articles=False)
    except Exception as e:
        print('(SOURCE ERROR) Source Skipped\n')
        print(e)
        continue

    print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

    if (len(source.articles) == 0):
        print('(ZERO ARTICLES) Source Skipped\n')
        continue

    for article in source.articles:
        start_time = time.clock()
        sleep()

        defragged_url = urldefrag(article.url).url
        clean_url = defragged_url[:defragged_url.find('?')]
        url_uuid = r.uuid(clean_url).run(conn)
        found_article = r.table('articles').get(url_uuid).run(conn)

        if found_article:
            print('\n(EXISTING URL) Skipped: ' + str(article.url) + '\n')
            print(' --' + found_article['url'])
            continue

        try:
            article.download()
            article.parse()
            artile.nlp()

            try:
                if langdetect.detect(article.text) != 'en':
                    print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                    continue
            except:
                print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                continue

            if  len(article.title.split()) < 5 and len(article.text.split()) < 100:
                print('\n(SHORT CONTENT) Skipped: ' + str(article.url) + '\n')
                continue

            if not article.text:
                print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')

                no_text_articles.append(article.url)

                with open(folder_path + '/no-text-articles.json', 'w+') as no_text_json_file:
                    json.dump(no_text_articles, no_text_json_file, indent=2, default=str)

                continue

            nation_pattern = re.compile('(?i)^(-+)?(PH|Philippines|Pilipinas|Filipino|Pilipino|Pinoy)(-*)?$')

            matched_locations = []
            for location in locations:
                location_pattern = re.compile('(?i)(City of '+location['location']+'|'+location['location']+' City|'+location['location']+' Municipality)+?,? ?('+location['province']+' Province|'+location['province']+'|Metro '+location['province']+')+?,? ?(Philippines|PH)?')

                if (location_pattern.match(article.text)):
                    matched_locations.append(location['id'])

            if not len(matched_locations):
                for province in provinces:
                    province_pattern = re.compile('(?i)('+province['province']+' Province|'+province['province']+'|Metro '+province['province']+')+?,? ?(Philippines|PH)?')

                    if (province_pattern.match(article.text)):
                        matched_locations.append(province['id'])

            if not len(matched_locations):
                if not nation_pattern.match(article.text):
                    print('\n(NOT PH RELATED) Article Skipped\n')
                    continue

            new_article = {
                'id': url_uuid,
                'url': clean_url,
                'sourceId': news_source['id'],
                'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                'authors': article.authors,
                'text': article.text.encode('ascii', 'ignore').decode('utf-8').replace('\n', ''),
                'publishDate': article.publish_date.strftime('%m/%d/%Y') if article.publish_date else '',
                'top_image': article.top_image,
                'timestamp': datetime.datetime.now().strftime('%m/%d/%Y %H:%M:%S'),
                'summary': summarizer(PlaintextParser.from_string(article.text), SENTENCES_COUNT),
                'summary2': aritcle.summary,
                'keywords': article.keywords,
                'locations': matched_locations,
                'category': text_client.UnsupervisedClassify({ "url": article.url, "classes": classes }),
                'sentiment': TextBlob(article.text).sentiment
                # 'images': article.images,
                # 'movies': article.movies
            }

            r.table('articles').insert(new_article).run(conn)

            count += 1

            print(str(count) + '.) ' + str(article.title) + ' | ' + str(article.url))
            print('-- ' + str('%.2f' % float(time.clock() - start_time)) + 's scraping runtime')

        except newspaper.ArticleException as e:
            print('\n(ARTICLE ERROR) Article Skipped\n')
            print(e)
            continue

    print('\n' + source.domain + ' done!')