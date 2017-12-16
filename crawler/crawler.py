# start CoreNLP server
# java -mx4g -cp "*" --add-modules java.xml.bind edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 500000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly
# for deployment
# nohup java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 500000 -annotators tokenize,ssplit,pos,lemma,ner,parse,sentiment -ssplit.eolonly &

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

load_dotenv(find_dotenv(), override=True)

locations = get_locations()
provinces = get_provinces()
has_news_sources = get_sources_count()

# news_sources = get_news_sources('timestamp')
# shuffle(news_sources)
# if not news_sources:
#     print('EMPTY NEWS SOURCES')

count = 0
slp_time = 0
crawled_sources = []

while True:
    news_sources = get_rand_sources(not_sources=crawled_sources)

    for news_source in news_sources:
        if not news_sources:
            print('CRAWLED ALL SOURCES')
            crawled_sources = []
            continue

        src_start_time = time.clock()
        src_art_count = 0

        url = news_source['contentData']['dataUrl']
        source_id = news_source['id']

        config = newspaper.Config()
        config.follow_meta_refresh = True
        config.browser_user_agent = UserAgent().random
        config.proxies = get_proxy()
        config.memoize_articles = True

        try:
            source = newspaper.build('http://'+url, config=config)
        except Exception as e:
            print('(SOURCE ERROR) Source Skipped\n')
            print(e)
            insert_log(source_id, 'sourceCrawl', 'error', float(time.clock() - src_start_time), {
                'errorMsg': 'SOURCE ERROR'
            })
            continue

        print('Proxies: http - ' + config.proxies['http'] + ' | https - ' + config.proxies['https'] )
        print('User-Agent: ' + config.browser_user_agent)
        print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

        insert_log(source_id, 'sourceCrawl', 'pending', float(time.clock() - src_start_time), {
            'proxies': config.proxies,
            'userAgent': config.browser_user_agent,
            'articlesCount': len(source.articles)
        })

        if (not source.articles):
            print('(ZERO ARTICLES) Source Skipped\n')
            insert_log(source_id, 'SOURCE ERROR', 'error', float(time.clock() - src_start_time), {})
            continue

        # 20 articles only for dev purposes
        for article in source.articles[:20]:
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
                        print('\n(HAS OTHER COUNTRY BUT NO PH) Skipped: ' + str(article.url) + '\n')
                        slp_time = insert_log(source_id, 'HAS OTHER COUNTRY BUT NO PH', 'error', float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': article.title
                        })
                        continue

                if not matched_locations:
                    if not nation_pattern.search(combined_body):
                        print('\n(UNPARSEABLE LOCATION) Skipped: ' + str(article.url) + '\n')
                        slp_time = insert_log(source_id, 'UNPARSEABLE LOCATION', 'error', float(time.clock() - start_time), {
                            'articleUrl': article.url,
                            'articleTitle': article.title
                        })
                        continue

                publishDate = search_publish_date(article.publish_date, article.html)

                if (not publishDate):
                    print('\n(UNPARSEABLE PUBLISH DATE) Skipped: ' + str(article.url) + '\n')
                    slp_time = insert_log(source_id, 'UNPARSEABLE PUBLISH DATE', 'error', float(time.clock() - start_time), {
                        'articleUrl': article.url,
                        'articleTitle': article.title
                    })
                    continue

                organizations, people = get_entities(body)
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
                    'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
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

        crawled_sources.append(source_id)

        print('\n' + source.domain + ' done!')
