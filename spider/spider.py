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
from urllib.parse import urldefrag, urlparse
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

def sleep(should_slp):
    if should_slp:
        slp_time = randrange(2, 6)
        print('\n> ' + str(slp_time) + 's sleep...\n')

        time.sleep(slp_time)


def get_author(html_doc):
    soup = BeautifulSoup(html_doc, 'html.parser')
    anchors = soup.find_all('a', href=True)
    author = ''

    for anchor in anchors:
        if 'author' in anchor['href'] and anchor:
            author = anchor.extract().get_text()

    if not author:
        byline_tags = soup.select('[class*=byline]')
        for byline_tag in byline_tags:
            author = byline_tag.extract().get_text()
            if author:
                break

    if not author:
        byline_tags = soup.select('[id*=byline]')
        for byline_tag in byline_tags:
            author = byline_tag.extract().get_text()
            if author:
                break

    author = re.sub('(?i)By ?', '', author)

    if len(author) > 50:
        author = ''

    return author.strip()

AMAZON_ACCESS_KEY = os.environ.get('AMAZON_ACCESS_KEY')
AMAZON_SECRET_KEY = os.environ.get('AMAZON_SECRET_KEY')
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')
AYLIEN_APP_ID = os.environ.get('AYLIEN_APP_ID')
AYLIEN_APP_KEY = os.environ.get('AYLIEN_APP_KEY')
AYLIEN_APP_ID2 = os.environ.get('AYLIEN_APP_ID2')
AYLIEN_APP_KEY2 = os.environ.get('AYLIEN_APP_KEY2')
LANGUAGE = 'english'
SENTENCES_COUNT = 5

stemmer = Stemmer(LANGUAGE)
summarizer = Summarizer(stemmer)
summarizer.stop_words = get_stop_words(LANGUAGE)

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)
locations = list( r.table('locations').eq_join('provinceId', r.table('provinces')).without({ 'right': {'id': True} }).zip().run(conn))
provinces = list(r.table('provinces').eq_join('capitalId', r.table('locations')).zip().run(conn))
news_sources = list(r.table('sources').order_by('dateAdded').run(conn))

text_client = textapi.Client(AYLIEN_APP_ID, AYLIEN_APP_KEY)
text_client2 = textapi.Client(AYLIEN_APP_ID2, AYLIEN_APP_KEY2)
classes = [
    'Business', 'Economy', 'Lifestyle',
    'Entertainment', 'Sports', 'Government & Politics',
    'Health', 'Science & Technology', 'Crime', 'Weather'
]
count = 0

if not news_sources:
    print('EMPTY NEWS SOURCES')

should_slp = False
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

    if (not source.articles):
        print('(ZERO ARTICLES) Source Skipped\n')
        continue

    for article in source.articles:
        start_time = time.clock()
        sleep(should_slp)

        defragged_url = urldefrag(article.url).url
        clean_url = defragged_url[:defragged_url.find('?')]
        url_uuid = r.uuid(clean_url).run(conn)
        found_article = r.table('articles').get(url_uuid).run(conn)

        if found_article:
            print('\n(EXISTING URL) Skipped: ' + str(article.url))
            print(' -- ' + found_article['id'] + '\n')
            should_slp = False
            continue

        try:
            article.download()
            article.parse()
            article.nlp()

            categories = []
            category1 = text_client.UnsupervisedClassify({ 'url': article.url, 'class': classes[:5] })
            category2 = text_client2.UnsupervisedClassify({ 'url': article.url, 'class': classes[5:] })
            categories = category1['classes'] + category2['classes']

            body = category1['text']

            try:
                if langdetect.detect(body) != 'en':
                    print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                    should_slp = True
                    continue
            except:
                print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                should_slp = True
                continue

            if  len(article.title.split()) < 5 and len(body.split()) < 100:
                print('\n(SHORT CONTENT) Skipped: ' + str(article.url) + '\n')
                should_slp = True
                continue

            if source.brand in body:
                print('\n(SOURCE IS IN BODY) Skipped: ' + str(article.url) + '\n')
                should_slp = True
                continue

            if not body:
                print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')

                no_text_articles.append(article.url)

                with open(folder_path + '/no-text-articles.json', 'w+') as no_text_json_file:
                    json.dump(no_text_articles, no_text_json_file, indent=2, default=str)
                should_slp = True
                continue

            nation_terms = 'PH|Philippines|Pilipinas|Filipino|Pilipino|Pinoy|Filipinos'
            nation_pattern = re.compile('(\W('+nation_terms+')$|^('+nation_terms+')\W|\W('+nation_terms+')\W)', re.IGNORECASE)
            combined_body = body + ' ' + article.text + ' ' + article.title + ' ' + urlparse(article.url).path

            matched_locations = []
            for location in locations:
                location_pattern = re.compile('\W(City of '+location['location']+'|'+location['location']+' City|'+location['location']+' Municipality|'+location['location']+')+,? ?('+location['province']+' Province|'+location['province']+'|Metro '+location['province']+')?,? ?(Philippines|PH)?\W', re.IGNORECASE)

                matched = location_pattern.search(combined_body)
                if matched:
                    matched_locations.append(location)

            if not matched_locations:
                for province in provinces:
                    province_pattern = re.compile('\W('+province['province']+' Province|'+province['province']+'|Metro '+province['province']+'|'+province['province']+')+,? ?(Philippines|PH)?\W', re.IGNORECASE)
                    matched = province_pattern.search(combined_body)

                    if matched:
                        matched_locations.append(province)

            if not matched_locations:
                if not nation_pattern.search(combined_body):
                    print('\n(NO PH LOCATIONS) Skipped: ' + str(article.url) + '\n')
                    should_slp = True
                    continue

            summary_sentences = []
            for summary in summarizer(PlaintextParser.from_string(body, Tokenizer(LANGUAGE)).document, SENTENCES_COUNT):
                summary_sentences.append(str(summary))

            blob = TextBlob(body)
            sentiment = {
                'polarity': blob.polarity,
                'subjectivity': blob.subjectivity
            }

            if not article.authors:
                author = get_author(article.html)
                if author:
                    article.authors.append(author)

            new_article = {
                'id': url_uuid,
                'url': clean_url,
                'sourceId': news_source['id'],
                'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                'authors': article.authors,
                'body': body,
                'publishDate': article.publish_date.strftime('%m/%d/%Y') if article.publish_date else '',
                'top_image': article.top_image,
                'timestamp': datetime.datetime.now().strftime('%m/%d/%Y %H:%M:%S'),
                'summary': summary_sentences,
                'summary2': article.summary,
                'keywords': article.keywords,
                'locations': matched_locations,
                'categories': categories,
                'sentiment': sentiment
                # 'images': article.images,
                # 'movies': article.movies
            }

            r.table('articles').insert(new_article).run(conn)

            count += 1

            aylien_status = text_client.RateLimits()
            aylien_status2 = text_client2.RateLimits()
            remaining = aylien_status['remaining'] + aylien_status2['remaining']
            print(str(count) + '.) ' + str(article.title) + ' | ' + str(article.url))
            print('Locations: ' + ' | '.join([ml['formattedAddress'] for ml in matched_locations]))
            print('AYLIEN REMAINING CALL: ['+str(aylien_status['remaining'])+', '+str(aylien_status2['remaining'])+'] -- ' + str('%.2f' % float(time.clock() - start_time)) + 's scraping runtime')
            should_slp = True

        except newspaper.ArticleException as e:
            print('\n(ARTICLE ERROR) Article Skipped\n')
            print(e)
            continue

    print('\n' + source.domain + ' done!')
