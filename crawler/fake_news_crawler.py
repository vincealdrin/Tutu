# start CoreNLP server
# java -mx4g -cp "*" --add-modules java.xml.bind edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 50000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly

import newspaper
import json
import time
import re
import langdetect
from random import randrange
from urllib.parse import urldefrag, urlparse
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from dotenv import load_dotenv, find_dotenv
from db import get_locations, get_sources, get_provinces, get_article, insert_fake_article, insert_log, get_uuid, get_rand_sources, get_source
from utils import PH_TIMEZONE, search_locations, search_authors, search_publish_date, sleep, get_popularity
from aylien import article_extraction
from nlp import get_entities, summarize
from nlp.keywords import parse_topics
from fake_useragent import UserAgent

load_dotenv(find_dotenv(), override=True)

count = 0
slp_time = 0
crawled_sources = []
loop_forever = True

while loop_forever:
    news_sources = get_rand_sources(
        not_sources=crawled_sources, count=1, table='fakeSources')
    # news_sources = [get_source('0ec1a833-9082-5d60-8c61-53305c7a2a90', table='fakeSources')]

    for news_source in news_sources:
        print('Crawled Sources: ' + str(crawled_sources))

        if news_source['id'] in crawled_sources:
            print(news_source)
            print('may mali')
            loop_forever = False
            break

        if not news_sources:
            print('CRAWLED ALL SOURCES')
            crawled_sources = []
            continue

        src_start_time = time.clock()
        print(news_source)
        url = news_source['url']
        config = newspaper.Config()
        # config.browser_user_agent = UserAgent().random
        config.follow_meta_refresh = True
        src_art_count = 0
        source_id = news_source['id']
        # config.proxies = get_proxies()

        try:
            source = newspaper.build(
                'http://' + url, config=config, memoize_articles=True)
        except Exception as e:
            print('(SOURCE ERROR) Source Skipped\n')
            print(e)
            continue

        print('\n' + source.domain + ' has ' + str(len(source.articles)) +
              ' articles\n')

        if (not source.articles):
            print('(ZERO ARTICLES) Source Skipped\n')
            continue

        for article in source.articles:
            start_time = time.clock()

            defragged_url = urldefrag(article.url).url
            qs_idx = defragged_url.find('?')
            clean_url = defragged_url[:qs_idx
                                      if qs_idx != -1 else None].replace(
                                          'www.', '')
            url_uuid = get_uuid(clean_url)
            existing_article = get_article(url_uuid, 'fakeArticles')

            if existing_article:
                print('\n(EXISTING URL) Skipped: ' + str(article.url))
                print(' -- ' + existing_article['id'] + '\n')
                slp_time = 0
                continue

            try:
                article.download()
                article.parse()

                title = article.title.split('|')[0].strip()

                pattern = re.compile(source.brand + '|\r|\n', re.IGNORECASE)
                pattern2 = re.compile('ADVERTISEMENT')
                body = pattern2.sub('', pattern.sub('', article.text))

                # try:
                #     if langdetect.detect(body) != 'en':
                #         print('\n(NOT ENGLISH) Skipped: ' + str(article.url) +
                #               '\n')
                #         continue
                # except:
                #     print(
                #         '\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                #     continue

                if not body:
                    print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                    continue

                if len(body.split()) < 50:
                    print('\n(SHORT CONTENT) Skipped: ' + str(article.url) +
                          '\n')
                    continue

                # publishDate = search_publish_date(article.publish_date,
                #   article.html)
                # organizations, people, error = get_entities(body)

                # if error:
                #     print('\n(TEXT IS TOO LONG) Skipped: ' + str(article.url) +
                #           '\n')
                #     slp_time = insert_log(source_id, 'TEXT IS TOO LONG',
                #                           'error',
                #                           float(time.clock() - start_time), {
                #                               'articleUrl': article.url,
                #                               'articleTitle': title
                #                           })
                #     continue

                sentiment = SentimentIntensityAnalyzer().polarity_scores(body)
                popularity = get_popularity(article.url)

                # if not article.authors:
                #     author = search_authors(article.html)
                #     if author:
                #         article.authors.append(author)

                if sentiment['compound'] >= 0.5:
                    sent_val = 'pos'
                elif sentiment['compound'] <= 0.5:
                    sent_val = 'neg'
                else:
                    sent_val = 'neu'

                new_article = {
                    'id': url_uuid,
                    'title': title.encode('ascii', 'ignore').decode('utf-8'),
                    'body': body,
                    'url': clean_url,
                    'sentiment': sent_val,
                    'socialScore': popularity['totalScore'],
                    'hasTopImage': 1 if article.top_image else 0,
                    'sourceHasAboutPage': news_source['hasAboutPage'],
                    'sourceHasContactPage': news_source['hasContactPage'],
                    'sourceSocialScore': news_source['socialScore'],
                    'sourceWorldRank': news_source['worldRank'],
                    'sourceCountryRank': news_source['countryRank'],
                }

                insert_fake_article(new_article)
                count += 1
                src_art_count += 1

                runtime = float(time.clock() - start_time)
                print(str(count) + '.) ' + str(title) + ' | ' + str(clean_url))

            except newspaper.ArticleException as e:
                print('\n(ARTICLE ERROR) Article Skipped\n')
                continue

        crawled_sources.append(source_id)

        print('\n' + source.domain + ' done!')
