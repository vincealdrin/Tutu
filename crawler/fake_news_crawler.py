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
from db import get_locations, get_news_sources, get_provinces, get_article, insert_article, get_uuid
from utils import PH_TIMEZONE, search_locations, search_authors, search_publish_date, sleep, get_popularity
from aylien import categorize
from nlp import get_entities, summarize
from nlp.keywords import parse_topics
from fake_useragent import UserAgent

load_dotenv(find_dotenv(), override=True)

news_sources = get_news_sources('timestamp', False, 'fakeSources')

if not news_sources:
    print('EMPTY NEWS SOURCES')

count = 0
slp_time = 0
for news_source in news_sources:
    src_start_time = time.clock()
    url = news_source['contentData']['dataUrl']
    config = newspaper.Config()
    # config.browser_user_agent = UserAgent().random
    config.follow_meta_refresh = True
    src_art_count = 0
    source_id = news_source['id']
    # config.proxies = get_proxies()

    try:
        source = newspaper.build('http://'+url, config=config,  memoize_articles=False)
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

        defragged_url = urldefrag(article.url).url
        print(defragged_url)
        qs_idx = defragged_url.find('?')
        clean_url = defragged_url[:qs_idx if qs_idx != -1 else None].replace('www.', '')
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

            pattern = re.compile(source.brand+'|\r|\n', re.IGNORECASE)
            body = pattern.sub('', article.text)

            try:
                if langdetect.detect(body) != 'en':
                    print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                    continue
            except:
                print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                continue

            if not body:
                print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                continue

            publishDate = search_publish_date(article.publish_date, article.html)
            organizations, people = get_entities(body)
            sentiment = SentimentIntensityAnalyzer().polarity_scores(body)
            popularity = get_popularity(article.url)

            if not article.authors:
                author = search_authors(article.html)
                if author:
                    article.authors.append(author)

            new_article = {
                'id': url_uuid,
                'url': clean_url,
                'sourceId': news_source['id'],
                'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                'authors': article.authors,
                'body': body,
                'publishDate': publishDate,
                'topImageUrl': article.top_image,
                'sentiment': sentiment,
                'organizations': organizations,
                'people': people,
                'popularity': popularity,
            }

            insert_article(new_article, 'fakeArticles')
            count += 1
            src_art_count += 1

            runtime = float(time.clock() - start_time)
            print(str(count) + '.) ' + str(article.title) + ' | ' + str(clean_url))

        except newspaper.ArticleException as e:
            print('\n(ARTICLE ERROR) Article Skipped\n')
            continue

    print('\n' + source.domain + ' done!')
