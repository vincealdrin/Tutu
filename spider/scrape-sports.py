import newspaper
import json
import time
from requests import get
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv, find_dotenv
import os
from urllib.parse import urlparse, urldefrag
import langdetect
import sys
from random import randrange
from fake_useragent import UserAgent
from uuid import uuid4

load_dotenv(find_dotenv(), override=True)

AMAZON_ACCESS_KEY = os.environ.get('AMAZON_ACCESS_KEY')
AMAZON_SECRET_KEY = os.environ.get('AMAZON_SECRET_KEY')

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
        slp_time = randrange(2, 5)
        print('\n> ' + str(slp_time) + 's sleep...\n')

        time.sleep(slp_time)

def scrape(sources_json_path):
    awis_count = 0
    count = 0
    folder_path = './sports-articles-' + str(uuid4())

    os.makedirs(folder_path)
    print(folder_path + ' folder created!')

    with open(sources_json_path) as json_data:
        news_sources = json.load(json_data)
        news_articles = []
        no_text_articles = []
        error_sources = []
        zero_articles_sources = []

        for news_source in news_sources:
            for url in news_source['urls']:
                config = newspaper.Config()
                config.browser_user_agent = UserAgent().random
                config.follow_meta_refresh = True
                # config.proxies = get_proxies()
                should_slp = False

                try:
                    source = newspaper.build('http://'+url, config=config, memoize_articles=False)
                except Exception as e:
                    print('(SOURCE ERROR) Source Skipped\n')
                    print(e)
                    continue

                print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

                for article in source.articles:
                    start_time = time.clock()
                    sleep(should_slp)

                    if not 'sports' in article.url:
                        print('\n(NOT SPORTS) Skipped: ' + str(article.url) + '\n')
                        should_slp = False
                        continue

                    if 'videos' in article.url or 'videos' in article.url:
                        print('\n(VIDEO) Skipped: ' + str(article.url) + '\n')
                        should_slp = False
                        continue

                    try:
                        article.download()
                        article.parse()

                        try:
                            if langdetect.detect(article.text) != 'en':
                                print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                                should_slp = False
                                continue
                        except:
                            print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                            should_slp = False
                            continue

                        if  len(article.title.split()) < 5 and len(article.text.split()) < 100:
                            print('\n(SHORT CONTENT) Skipped: ' + str(article.url) + '\n')
                            should_slp = False
                            continue

                        if not article.text:
                            print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                            should_slp = False
                            no_text_articles.append(article.url)

                            with open(folder_path + '/no-text-articles.json', 'w+') as no_text_json_file:
                                json.dump(no_text_articles, no_text_json_file, indent=2, default=str)

                            continue

                        new_article = {
                            'url': urldefrag(article.url).url,
                            'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                            'authors': article.authors,
                            'text': article.text.encode('ascii', 'ignore').decode('utf-8').replace('\n', ''),
                            'publish_date': article.publish_date.strftime('%m/%d/%Y') if article.publish_date else '',
                            'top_image': article.top_image
                            # 'images': article.images,
                            # 'movies': article.movies
                        }

                        news_articles.append(new_article)
                        count += 1

                        print(str(count) + '.) ' + str(article.title) + ' | ' + str(article.url))
                        print('-- ' + str('%.2f' % float(time.clock() - start_time)) + 's scraping runtime')

                        with open(folder_path + '/articles.json', 'w+') as json_file:
                            json.dump(news_articles, json_file, indent=2, sort_keys=True, default=str)

                        should_slp = True

                    except newspaper.ArticleException as e:
                        print('\n(ARTICLE ERROR) Article Skipped\n')
                        print(e)
                        continue

            print('\n' + source.domain + ' done!')

scrape(sys.argv[1])
