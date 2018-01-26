# start CoreNLP server
# java -mx4g -cp "*" --add-modules java.xml.bind edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 20000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly
# for deployment
# nohup java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 20000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly &
# hack method to backup db on server
# rethinkdb dump -c localhost:28015
# tar zxvf ./rethinkdb_dump_2017-01-24T21:42:08.tar.gz
# rm rethinkdb_dump_2017-01-24T21:21:47.tar.gz
# mv rethinkdb_dump_2017-01-24T21:42:08 rethinkdb_dump_2017-01-24
# tar -czvf rethinkdb_dump_2017-01-24.tar.gz rethinkdb_dump_2017-01-24
import newspaper
from newspaper.nlp import summarize, keywords
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
import json
import time
from datetime import datetime
import re
from random import randrange
from urllib.parse import urldefrag, urlparse
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from dotenv import load_dotenv, find_dotenv
from db import get_locations, get_provinces, get_one, insert_article, insert_log, get_uuid, get_rand_sources, get_sources, insert_item
from utils import PH_TIMEZONE, search_locations, search_authors, get_publish_date, sleep, get_popularity, get_proxy, clean_url
from aylien import categorize, get_rate_limits
from nlp import get_entities, summarize2
from nlp.keywords import parse_topics
from fake_useragent import UserAgent
import rethinkdb as r
import re
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
last_proxy = ''

while True:
    news_sources = get_rand_sources(1, isReliable=False)

    for news_source in news_sources:
        src_start_time = time.clock()
        src_art_count = 0

        url = news_source['url']
        source_id = news_source['id']

        config = newspaper.Config()
        config.follow_meta_refresh = True
        # config.memoize_articles = True if PY_ENV == 'production' else False
        config.memoize_articles = False

        proxy = get_proxy(last_proxy)
        last_proxy = proxy['http']

        if PY_ENV == 'production':
            config.browser_user_agent = UserAgent().random
            config.proxies = proxy

        try:
            source = newspaper.build(url, config=config)
        except Exception as e:
            if PY_ENV == 'development':
                print('(SOURCE ERROR) Source Skipped\n')
            insert_log(source_id, 'sourceCrawl', 'error',
                       float(time.clock() - src_start_time), {
                           'errorMessage': 'SOURCE ERROR',
                           'crawlerName': 'not credible crawler'
                       })
            continue

        error_articles = []
        prev_uuid = ''
        for article in source.articles:
            url_uuid = get_uuid(clean_url(article.url))
            article.id = url_uuid

            if prev_uuid == url_uuid:
                continue

            if get_one(url_uuid, 'errorArticles') or get_one(
                    url_uuid, 'articles'):
                error_articles.append(article.id)

            prev_uuid = url_uuid

        source.articles = [
            a for a in source.articles if a.id not in error_articles
        ]

        if PY_ENV == 'development':
            print('Proxy: ' + proxy['http'])
            print('User-Agent: ' + config.browser_user_agent)
            print('\nCrawler found new ' + str(len(source.articles)) +
                  ' articles in http://' + source.domain + '\n')

        insert_log(
            source_id, 'sourceCrawl', 'pending',
            float(time.clock() - src_start_time), {
                'proxy': proxy['http'],
                'userAgent': config.browser_user_agent,
                'articlesCount': len(source.articles),
                'crawlerName': 'not credible crawler'
            })

        if not source.articles:
            if PY_ENV == 'development':
                print('(ZERO ARTICLES) Source Skipped\n')
            slp_time = insert_log(source_id, 'sourceCrawl', 'error',
                                  float(time.clock() - src_start_time), {
                                      'errorMessage': 'ZERO ARTICLES',
                                      'crawlerName': 'not credible crawler'
                                  })
            continue

        for article in source.articles:
            repeat_categorize = True

            start_time = time.clock()
            sleep(slp_time)

            if PY_ENV == 'development':
                print(article.url)

            insert_log(source_id, 'articleCrawl', 'pending', float(slp_time), {
                'articleUrl': article.url,
                'crawlerName': 'not credible crawler'
            })

            if re.search('/(category|gallery|photos?)/', article.url,
                         re.IGNORECASE):
                if PY_ENV == 'development':
                    print('\n(NOT AN ARTICLE PAGE) Skipped: ' +
                          str(article.url) + '\n')
                slp_time = insert_log(
                    source_id, 'articleCrawl', 'error',
                    float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'errorMessage': 'NOT AN ARTICLE PAGE',
                        'crawlerName': 'not credible crawler'
                    })
                insert_item({'id': article.id}, 'errorArticles')
                continue

            try:
                article.download()
                article.parse()

                title = article.title
                title_split = article.title.split('|')

                if len(title_split) != 1:
                    title = title_split[0].strip()

                while repeat_categorize:
                    categories, body = categorize(article.url, True)

                    if categories == 'API LIMIT':
                        print('REACHED AYLIEN LIMIT')
                        insert_log(
                            source_id, 'articleCrawl', 'error',
                            float(time.clock() - start_time), {
                                'errorMessage':
                                'REACHED AYLIEN LIMIT (1 HOUR SLEEP)',
                                'crawlerName':
                                'not credible crawler'
                            })
                        repeat_categorize = True
                        sleep(3600)
                    else:
                        repeat_categorize = False

                if categories is None and body is None:
                    if PY_ENV == 'development':
                        print('\n(CAN\'T PARSE BODY) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'CAN\'T PARSE BODY',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                pattern = re.compile(source.brand, re.IGNORECASE)
                body = pattern.sub('', body)

                if len(body.split()) < 50:
                    if PY_ENV == 'development':
                        print('\n(SHORT CONTENT) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'SHORT CONTENT',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                if source.brand in body:
                    if PY_ENV == 'development':
                        print('\n(SOURCE IS IN BODY) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'SOURCE IS IN BODY',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                if not body:
                    if PY_ENV == 'development':
                        print(
                            '\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'NO TEXT',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                combined_body = body + ' ' + article.text + ' ' + title + ' ' + urlparse(
                    article.url).path
                matched_locations = search_locations(combined_body, locations,
                                                     provinces)

                nation_terms = r'\WPH|Philippines?|Pilipinas|Filipino|Pilipino|Pinoy|Filipinos\W'
                nation_pattern = re.compile(
                    r'(\W(' + nation_terms + ')$|^(' + nation_terms +
                    r')\W|\W(' + nation_terms + r')\W)', re.IGNORECASE)

                with open('./world-countries.json') as countries_file:
                    countries = json.load(countries_file)
                for country in countries:
                    if country in combined_body and not nation_pattern.search(
                            combined_body):
                        if PY_ENV == 'development':
                            print('\n(HAS OTHER COUNTRY BUT NO PH) Skipped: ' +
                                  str(article.url) + '\n')
                        slp_time = insert_log(
                            source_id, 'articleCrawl', 'error',
                            float(time.clock() - start_time), {
                                'articleUrl': article.url,
                                'articleTitle': title,
                                'errorMessage': 'HAS OTHER COUNTRY BUT NO PH',
                                'crawlerName': 'not credible crawler'
                            })
                        insert_item({'id': article.id}, 'errorArticles')
                        continue

                # if not matched_locations:
                #     if not nation_pattern.search(combined_body):
                #         if PY_ENV == 'development':
                #             print('\n(CAN\'T FIND LOCATION) Skipped: ' +
                #                   str(article.url) + '\n')
                #         slp_time = insert_log(
                #             source_id, 'articleCrawl', 'error',
                #             float(time.clock() - start_time), {
                #                 'articleUrl': article.url,
                #                 'articleTitle': title,
                #                 'errorMessage': 'CAN\'T FIND LOCATION'
                #             })
                #         insert_item({'id': article.id}, 'errorArticles')
                #         continue

                publish_date = get_publish_date(article.html)

                if publish_date.year < 2014 or publish_date.replace(
                        tzinfo=None) > datetime.now():
                    if PY_ENV == 'development':
                        print('\n(PUBLISH DATE NOT IN RANGE) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'PUBLISH DATE NOT IN RANGE',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                if (not publish_date):
                    if PY_ENV == 'development':
                        print('\n(CAN\'T FIND PUBLISH DATE) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'CAN\'T FIND PUBLISH DATE',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                publish_date = r.expr(publish_date)
                organizations, people, error = get_entities(body)

                if error:
                    if PY_ENV == 'development':
                        print('\n(TEXT IS TOO LONG) Skipped: ' +
                              str(article.url) + '\n')
                    slp_time = insert_log(
                        source_id, 'articleCrawl', 'error',
                        float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': title,
                            'errorMessage': 'TEXT IS TOO LONG',
                            'crawlerName': 'not credible crawler'
                        })
                    insert_item({'id': article.id}, 'errorArticles')
                    continue

                # summary_sentences = summarize2(body)
                # summary_sentences = [
                #     s for s in summary_sentences if len(s.split(' ')) > 5
                # ]

                sentiment = SentimentIntensityAnalyzer().polarity_scores(body)
                # topics = parse_topics(body)
                popularity = get_popularity(article.url)

                if not article.authors:
                    author = search_authors(article.html)
                    if author:
                        article.authors.append(author)

                article.top_image = '' if re.search(
                    'favicon', article.top_image) else article.top_image

                with open('../detector/tl_stopwords.txt', 'r') as f:
                    TL_STOPWORDS = f.read().splitlines()

                STOP_WORDS = ENGLISH_STOP_WORDS.union(TL_STOPWORDS)
                cleaned_body = ' '.join([
                    word for word in body.split()
                    if word.lower() not in STOP_WORDS
                ])
                cleaned_title = ' '.join([
                    word for word in title.split()
                    if word.lower() not in STOP_WORDS
                ])
                text_keyws = list(keywords(cleaned_body).keys())
                title_keyws = list(keywords(cleaned_title).keys())
                keyws = list(set(title_keyws + text_keyws))

                summary = summarize(
                    title=article.title, text=body, max_sents=3)

                # keywords = []
                # for key, value in article.keywords.items():
                #     keywords.append({
                #         'word': key,
                #         'score': value
                #     })

                # keywords = sorted(
                #         keywords, key=lambda k: k['score'], reverse=True)
                # keywords = [keyword['word'] for keyword in keywords]

                new_article = {
                    'id': article.id,
                    'url': article.url,
                    'sourceId': news_source['id'],
                    'title': title,
                    'authors': article.authors,
                    'body': body,
                    'publishDate': publish_date,
                    'topImageUrl': article.top_image,
                    # 'summary': summary_sentences,
                    'summary': summary,
                    'keywords': keyws,
                    'locations': matched_locations,
                    'categories': categories,
                    'sentiment': sentiment,
                    'organizations': organizations,
                    'people': people,
                    'popularity': popularity,
                    'reactions': [],
                    'relatedArticles': []
                }

                insert_article(new_article, False)
                count += 1
                src_art_count += 1
                runtime = float(time.clock() - start_time)

                if PY_ENV == 'development':
                    print(
                        str(count) + '.) ' + str(title) + ' | ' +
                        str(article.url))
                    print('Locations: ' + ' | '.join([
                        ml['location']['formattedAddress']
                        for ml in matched_locations
                    ]))

                slp_time = insert_log(source_id, 'articleCrawl', 'success',
                                      float(time.clock() - start_time), {
                                          'articleId': article.id,
                                          'crawlerName': 'not credible crawler'
                                      })

            except newspaper.ArticleException as e:
                if PY_ENV == 'development':
                    print('\n(ARTICLE ERROR) Article Skipped\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error',
                                      float(time.clock() - start_time), {
                                          'articleUrl': url,
                                          'crawlerName': 'not credible crawler'
                                      })
                continue

        insert_log(source_id, 'sourceCrawl', 'success',
                   float(time.clock() - src_start_time), {
                       'articlesCrawledCount': src_art_count,
                       'crawlerName': 'not credible crawler'
                   })

        if PY_ENV == 'development':
            print('\n' + source.domain + ' done!')
        sleep(randrange(2, 6))
