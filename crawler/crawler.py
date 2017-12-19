# start CoreNLP server
# java -mx4g -cp "*" --add-modules java.xml.bind edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 20000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly
# for deployment
# nohup java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 20000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly &

import newspaper
import json
import time
import re
import langdetect
from random import randrange
from urllib.parse import urldefrag, urlparse
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from dotenv import load_dotenv, find_dotenv
from db import get_locations, get_sources, get_provinces, get_article, insert_article, insert_log, get_uuid, get_rand_sources, get_sources_count
from utils import PH_TIMEZONE, search_locations, search_authors, search_publish_date, sleep, get_popularity, get_proxy
from aylien import categorize
from nlp import get_entities, summarize
from nlp.keywords import parse_topics
from fake_useragent import UserAgent
from random import shuffle
import os

load_dotenv(find_dotenv(), override=True)

locations = get_locations()
provinces = get_provinces()

# news_sources = get_news_sources('timestamp')
# shuffle(news_sources)
# if not news_sources:
# if PY_ENV == 'development':
    # print('EMPTY NEWS SOURCES')

PY_ENV = os.environ.get('PY_ENV')
count = 0
slp_time = 0
crawled_sources = []
last_proxy = ''

while True:
    news_sources = get_rand_sources(not_sources=crawled_sources)

    for news_source in news_sources:
        if not news_sources:
            if PY_ENV == 'development':
                print('CRAWLED ALL SOURCES')
            crawled_sources = []
            continue

        src_start_time = time.clock()
        src_art_count = 0

        url = news_source['url']
        source_id = news_source['id']

        config = newspaper.Config()
        config.follow_meta_refresh = True
        config.memoize_articles = True

        if PY_ENV == 'production':
            config.browser_user_agent = UserAgent().random
            config.proxies = proxy

        proxy = get_proxy(last_proxy)
        last_proxy = proxy['http']

        try:
            source = newspaper.build('http://'+url, config=config)
        except Exception as e:
            if PY_ENV == 'development':
                print('(SOURCE ERROR) Source Skipped\n')
            insert_log(source_id, 'sourceCrawl', 'error', float(time.clock() - src_start_time), {
                'errorMessage': 'SOURCE ERROR'
            })
            continue

        if PY_ENV == 'production':
            if PY_ENV == 'development':
                print('Proxy: ' + proxy['http'])
            if PY_ENV == 'development':
                print('User-Agent: ' + config.browser_user_agent)

        if PY_ENV == 'development':
            print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

        insert_log(source_id, 'sourceCrawl', 'pending', float(time.clock() - src_start_time), {
            'proxy': proxy['http'],
            'userAgent': config.browser_user_agent,
            'articlesCount': len(source.articles)
        })

        if (not source.articles):
            if PY_ENV == 'development':
                print('(ZERO ARTICLES) Source Skipped\n')
            insert_log(source_id, 'SOURCE ERROR', 'error', float(time.clock() - src_start_time), {})
            continue

        # 20 articles only for dev purposes
        for article in source.articles:
            start_time = time.clock()

            sleep(slp_time)

            defragged_url = urldefrag(article.url).url
            qs_idx = defragged_url.find('?')
            clean_url = defragged_url[:qs_idx if qs_idx != -1 else None]
            clean_url = clean_url.replace('https', 'http').replace('www.', '')
            url_uuid = get_uuid(clean_url)

            insert_log(source_id, 'articleCrawl', 'pending', float(time.clock() - start_time), {
                'articleUrl': article.url
            })

            existing_article = get_article(url_uuid)
            if existing_article:
                if PY_ENV == 'development':
                    print('\n(EXISTING URL) Skipped: ' + str(article.url))
                    print(' -- ' + existing_article['id'] + '\n')
                insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': article.url,
                    'errorMessage': 'EXISTING URL'
                })
                slp_time = 0
                continue

            try:
                article.download()
                article.parse()
                article.nlp()

                title = article.title.split('|')[0].strip()

                categories, body, rate_limits = categorize(article.url)

                pattern = re.compile(source.brand, re.IGNORECASE)
                body = pattern.sub('', body)

                try:
                    if langdetect.detect(body) != 'en':
                        if PY_ENV == 'development':
                            print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                        slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'NOT ENGLISH',
                        })
                        continue
                except:
                    if PY_ENV == 'development':
                        print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title,
                        'errorMessage': 'NOT ENGLISH',
                    })
                    continue

                if  len(body.split()) < 100:
                    if PY_ENV == 'development':
                        print('\n(SHORT CONTENT) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title,
                        'errorMessage': 'SHORT CONTENT',

                    })
                    continue

                if source.brand in body:
                    if PY_ENV == 'development':
                        print('\n(SOURCE IS IN BODY) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title,
                        'errorMessage': 'SOURCE IS IN BODY',
                    })
                    continue

                if not body:
                    if PY_ENV == 'development':
                        print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title,
                        'errorMessage': 'NO TEXT',
                    })
                    continue

                combined_body = body + ' ' + article.text + ' ' + title + ' ' + urlparse(article.url).path
                matched_locations = search_locations(combined_body, locations, provinces)

                nation_terms = '\WPH|Philippines?|Pilipinas|Filipino|Pilipino|Pinoy|Filipinos\W'
                nation_pattern = re.compile('(\W('+nation_terms+')$|^('+nation_terms+')\W|\W('+nation_terms+')\W)', re.IGNORECASE)

                with open('./world-countries.json') as countries_file:
                    countries = json.load(countries_file)
                for country in countries:
                    if country in combined_body and not nation_pattern.search(combined_body):
                        if PY_ENV == 'development':
                            print('\n(HAS OTHER COUNTRY BUT NO PH) Skipped: ' + str(article.url) + '\n')
                        slp_time = insert_log(source_id, 'HAS OTHER COUNTRY BUT NO PH', 'error', float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title
                        })
                        continue

                if not matched_locations:
                    if not nation_pattern.search(combined_body):
                        if PY_ENV == 'development':
                            print('\n(CAN\'T FIND LOCATION) Skipped: ' + str(article.url) + '\n')
                        slp_time = insert_log(source_id, 'CAN\'T FIND LOCATION', 'error', float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title
                        })
                        continue

                publishDate = search_publish_date(article.publish_date, article.html)

                if (not publishDate):
                    if PY_ENV == 'development':
                        print('\n(CAN\'T FIND PUBLISH DATE) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'CAN\'T FIND PUBLISH DATE', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title
                    })
                    continue

                organizations, people, error = get_entities(body)

                if error:
                    if PY_ENV == 'development':
                        print('\n(TEXT IS TOO LONG) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'TEXT IS TOO LONG', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': title
                    })
                    continue

                summary_sentences = summarize(body)
                sentiment = SentimentIntensityAnalyzer().polarity_scores(body)
                topics = parse_topics(body)
                popularity = get_popularity(article.url)

                if not article.authors:
                    author = search_authors(article.html)
                    if author:
                        article.authors.append(author)

                new_article = {
                    'id': url_uuid,
                    'url': clean_url,
                    'sourceId': news_source['id'],
                    'title': title.encode('ascii', 'ignore').decode('utf-8'),
                    'authors': article.authors,
                    'body': body,
                    'publishDate': publishDate,
                    'topImageUrl': article.top_image,
                    'summary': summary_sentences,
                    'summary2': article.summary,
                    'topics': topics,
                    'locations': matched_locations,
                    'categories': categories,
                    'sentiment': sentiment,
                    'organizations': organizations,
                    'people': people,
                    'popularity': popularity,
                    'reactions': []
                }

                insert_article(new_article)
                count += 1
                src_art_count += 1

                runtime = float(time.clock() - start_time)
                aylien_status = rate_limits[0]
                aylien_status2 = rate_limits[1]
                aylien_status3 = rate_limits[2]
                if PY_ENV == 'development':
                    print(str(count) + '.) ' + str(title) + ' | ' + str(article.url))
                if PY_ENV == 'development':
                    print('Locations: ' + ' | '.join([ml['location']['formattedAddress'] for ml in matched_locations]))
                if PY_ENV == 'development':
                    print('AYLIEN REMAINING CALL: ['+str(aylien_status['remaining'])+', '+str(aylien_status2['remaining'])+', '+str(aylien_status3['remaining'])+'] -- ' + str('%.2f' % runtime + 's scraping runtime'))

                slp_time = insert_log(source_id, 'articleCrawl', 'success', float(time.clock() - start_time), {
                    'articleId': url_uuid
                })

            except newspaper.ArticleException as e:
                if PY_ENV == 'development':
                    print('\n(ARTICLE ERROR) Article Skipped\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': url
                })
                continue

        insert_log(source_id, 'sourceCrawl', 'success', float(time.clock() - src_start_time), {
            'articlesCrawledCount': src_art_count,
        })

        crawled_sources.append(source_id)

        if PY_ENV == 'development':
            print('\n' + source.domain + ' done!')
