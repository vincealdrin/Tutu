import newspaper
import json
import time
import re
import langdetect
from random import randrange
import rethinkdb as r
from urllib.parse import urldefrag, urlparse
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from dotenv import load_dotenv, find_dotenv
from db import get_locations, get_news_sources, get_provinces, get_article, insert_article, insert_log, get_uuid
from utils import PH_TIMEZONE, search_locations, search_authors, search_publish_date, sleep, get_shared_count
from aylien import categorize
from nlp import get_entities, summarize
from nlp.keywords import parse_topics
from fake_useragent import UserAgent

load_dotenv(find_dotenv(), override=True)

locations = get_locations()
provinces = get_provinces()
news_sources = get_news_sources('timestamp', True)

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
        insert_log(source_id, 'sourceCrawl', 'error', float(time.clock() - src_start_time), {
            'errorMsg': 'SOURCE ERROR'
        })
        continue

    print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

    insert_log(source_id, 'sourceCrawl', 'pending', float(time.clock() - src_start_time), {
        'articlesCount': len(source.articles)
    })

    if (not source.articles):
        print('(ZERO ARTICLES) Source Skipped\n')
        insert_log(source_id, 'SOURCE ERROR', 'error', float(time.clock() - src_start_time))
        continue

    for article in source.articles:
        start_time = time.clock()

        sleep(slp_time)

        defragged_url = urldefrag(article.url).url
        clean_url = defragged_url[:defragged_url.find('?')].replace('www.', '')
        url_uuid = get_uuid(clean_url)

        insert_log(source_id, 'articleCrawl', 'pending', float(time.clock() - start_time), {
            'articleUrl': article.url
        })

        existing_article = get_article(url_uuid)
        if existing_article:
            print('\n(EXISTING URL) Skipped: ' + str(article.url))
            print(' -- ' + existing_article['id'] + '\n')
            insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                'articleUrl': article.url,
                'errorMsg': 'EXISTING URL'
            })
            slp_time = 0
            continue

        try:
            article.download()
            article.parse()
            article.nlp()

            cat_result = categorize(article.url)
            categories, body, rate_limits = categorize(article.url)

            pattern = re.compile(source.brand, re.IGNORECASE)
            body = pattern.sub('', body)

            try:
                if langdetect.detect(body) != 'en':
                    print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': article.title,
                        'errorMsg': 'NOT ENGLISH',
                    })
                    continue
            except:
                print('\n(NOT ENGLISH) Skipped: ' + str(article.url) + '\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': article.url,
                    'articleTitle': article.title,
                    'errorMsg': 'NOT ENGLISH',
                })
                continue

            if  len(body.split()) < 100:
                print('\n(SHORT CONTENT) Skipped: ' + str(article.url) + '\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': article.url,
                    'articleTitle': article.title,
                    'errorMsg': 'SHORT CONTENT',

                })
                continue

            if source.brand in body:
                print('\n(SOURCE IS IN BODY) Skipped: ' + str(article.url) + '\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': article.url,
                    'articleTitle': article.title,
                    'errorMsg': 'SOURCE IS IN BODY',

                })
                continue

            if not body:
                print('\n(NO TEXT) Skipped: ' + str(article.url) + '\n')
                slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                    'articleUrl': article.url,
                    'articleTitle': article.title,
                    'errorMsg': 'NO TEXT',
                })
                continue

            combined_body = body + ' ' + article.text + ' ' + article.title + ' ' + urlparse(article.url).path
            matched_locations = search_locations(combined_body, locations, provinces)

            nation_terms = '\WPH|Philippines?|Pilipinas|Filipino|Pilipino|Pinoy|Filipinos\W'
            nation_pattern = re.compile('(\W('+nation_terms+')$|^('+nation_terms+')\W|\W('+nation_terms+')\W)', re.IGNORECASE)

            with open('./world-countries.json') as countries_file:
                countries = json.load(countries_file)
            for country in countries:
                if country in combined_body and not nation_pattern.search(combined_body):
                    print('\n(OTHER COUNTRY BUT NO PH) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'OTHER COUNTRY BUT NO PH', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': article.title
                    })
                    continue

            if not matched_locations:
                if not nation_pattern.search(combined_body):
                    print('\n(NO PH LOCATIONS) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'NO PH LOCATIONS', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': article.title
                    })
                    continue

            organizations, people = get_entities(body)
            summary_sentences = summarize(body)
            sentiment = SentimentIntensityAnalyzer().polarity_scores(body)

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
                'publishDate': search_publish_date(article.publish_date, article.html),
                'topImageUrl': article.top_image,
                'summary': summary_sentences,
                'summary2': article.summary,
                # 'keywords': article.keywords,
                'topics': parse_topics(body),
                'locations': matched_locations,
                'categories': categories,
                'sentiment': sentiment,
                'organizations': organizations,
                'people': people,
                'sharedCount': get_shared_count(article.url)
            }

            insert_article(new_article)
            count += 1
            src_art_count += 1

            runtime = float(time.clock() - start_time)
            aylien_status = rate_limits[0]
            aylien_status2 = rate_limits[1]
            aylien_status3 = rate_limits[2]
            print(str(count) + '.) ' + str(article.title) + ' | ' + str(article.url))
            print('Locations: ' + ' | '.join([ml['location']['formattedAddress'] for ml in matched_locations]))
            print('AYLIEN REMAINING CALL: ['+str(aylien_status['remaining'])+', '+str(aylien_status2['remaining'])+', '+str(aylien_status3['remaining'])+'] -- ' + str('%.2f' % runtime + 's scraping runtime'))

            slp_time = insert_log(source_id, 'articleCrawl', 'success', float(time.clock() - start_time), {
                'articleId': url_uuid
            })

        except newspaper.ArticleException as e:
            print('\n(ARTICLE ERROR) Article Skipped\n')
            slp_time = insert_log(source_id, 'articleCrawl', 'error', float(time.clock() - start_time), {
                'articleUrl': url,
                'articleTitle': article.title if article.title else '',
            })
            continue

    insert_log(source_id, 'sourceCrawl', 'success', float(time.clock() - src_start_time), {
        'articlesCrawledCount': src_art_count,
    })

    print('\n' + source.domain + ' done!')
