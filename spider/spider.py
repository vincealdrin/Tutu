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
from sumy.parsers.plaintext import PlaintextParser #We're choosing a plaintext parser here, other parsers available for HTML etc.
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

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
LANGUAGE = 'english'
SENTENCES_COUNT = 5

stemmer = Stemmer(LANGUAGE)
summarizer = Summarizer(stemmer)
summarizer.stop_words = get_stop_words(LANGUAGE)
conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)
news_sources = r.table('sources').run(conn)
count = 0

with open('./locations-ph.json') as locations_data:
    locations = json.load(locations_data)

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
            found_articles = r.table('articles').get_all(clean_url, index='url').run(conn)
            print(found_articles)
            if len(found_articles):
                print('\n(EXISTING URL) Skipped: ' + str(article.url) + '\n')
                # print('-- id: ': found_articles)
                continue

            try:
                article.download()
                article.parse()

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

                new_article = {
                    'source_id': news_source['id'],
                    'url': urldefrag(article.url).url,
                    'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                    'authors': article.authors,
                    'text': article.text.encode('ascii', 'ignore').decode('utf-8').replace('\n', ''),
                    'publish_date': article.publish_date.strftime('%m/%d/%Y') if article.publish_date else '',
                    'top_image': article.top_image,
                    'timestamp': datetime.datetime.now().strftime('%m/%d/%Y %H:%M:%S'),
                    'summary': summarizer(PlaintextParser.from_string(article.text), SENTENCES_COUNT),
                    'lan': ,
                    'lon': ,
                    'category': '',
                    'sentiment': ''
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