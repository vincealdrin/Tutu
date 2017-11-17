import newspaper
import json
import time
from requests import get
from bs4 import BeautifulSoup
import re
from myawis.myawis import CallAwis, URLINFO_RESPONSE_GROUPS
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

def sleep():
    slp_time = randrange(2, 6)
    print('\n> ' + str(slp_time) + 's sleep...\n')

    time.sleep(slp_time)

def scrape(sources_json_path):
    awis_count = 0
    count = 0
    folder_path = './articles-' + str(uuid4())

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

                try:
                    source = newspaper.build('http://'+url, config=config, memoize_articles=False)
                except Exception as e:
                    print('(SOURCE ERROR) Source Skipped\n')
                    print(e)
                    continue

                print('\n' + source.domain + ' has ' + str(len(source.articles)) + ' articles\n')

                if (len(source.articles) == 0):
                    print('(ZERO ARTICLES) Source Skipped\n')
                    zero_articles_sources.append(source.url)
                    with open(folder_path + '/zero-articles-sources.json', 'w+') as no_text_json_file:
                        json.dump(zero_articles_sources, no_text_json_file, indent=2, default=str)
                    continue

                # contact_us_pattern = re.compile('(?i)contact us')
                # about_us_pattern = re.compile('(?i)about us')
                # soup = BeautifulSoup(source.html, 'html.parser')
                # contact_us_url_tag = soup.find('a', text=contact_us_pattern)
                # contact_us_url = contact_us_url_tag['href'] if contact_us_url_tag else None
                # about_us_url_tag = soup.find('a', text=about_us_pattern)
                # about_us_url = about_us_url_tag['href'] if about_us_url_tag else None

                # # if contact or about anchor tag is not in the article page check the homepage instead
                # if contact_us_url is None or about_us_url is None:
                #     try:
                #         html_doc = get('http://'+source.domain).content

                #         if contact_us_url is None:
                #             contact_soup = BeautifulSoup(html_doc, 'html.parser')
                #             contact_us_url_tag = contact_soup.find('a', text=contact_us_pattern)
                #             contact_us_url = contact_us_url_tag['href'] if contact_us_url_tag else None
                #         else:
                #             if contact_us_url[0] == '/' and contact_us_url[1] != '/':
                #                 contact_us_url = source.url + contact_us_url

                #             if contact_us_url[:2] == '//':
                #                 contact_us_url = 'http:' + contact_us_url

                #         if about_us_url is None:
                #             about_soup = BeautifulSoup(html_doc, 'html.parser')
                #             about_us_url_tag = about_soup.find('a', text=about_us_pattern)
                #             about_us_url = about_us_url_tag['href'] if about_us_url_tag else None
                #         else:
                #             if about_us_url[0] == '/' and about_us_url[1] != '/':
                #                 about_us_url = source.url + about_us_url

                #             if about_us_url[:2] == '//':
                #                 about_us_url = 'http:' + about_us_url

                #         sleep()
                #     except Exception as e:
                #         print('(SOURCE ERROR) Source Skipped\n')
                #         print(e)

                #         error_sources.append(source.url)
                #         with open(folder_path + '/error-sources.json', 'w+') as no_text_json_file:
                #             json.dump(error_sources, no_text_json_file, indent=2, default=str)

                #         continue

                # contact_us_url = contact_us_url if urlparse(contact_us_url).netloc else ''
                # about_us_url = about_us_url if urlparse(about_us_url).netloc else ''

                # source_info = next((n['source'] for n in news_articles if n['source']['domain'] == source.domain), None)

                # # If source has still no info call AWIS
                # if source_info is None and len(source.articles) > 0:
                #     awis_obj = CallAwis(source.domain, URLINFO_RESPONSE_GROUPS, AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY)

                #     awis_count += 1
                #     print('AWIS call count: ' + str(awis_count))

                #     url_info = awis_obj.urlinfo()
                #     content_data = url_info.ContentData
                #     country = url_info.Country
                #     traffic_data = url_info.TrafficData
                #     category = url_info.Related.Categories.CategoryData if url_info.Related.Categories else None

                #     related_links = []
                #     contributing_subdomains = []
                #     ranks_by_country = []
                #     other_owned_domains = []

                #     for related_link in url_info.find_all('RelatedLink'):
                #         related_links.append({
                #             'url': urldefrag(related_link.NavigableUrl.text).url,
                #             'title': related_link.Title.text,
                #         })

                #     for subdomain_url in url_info.find_all('ContributingSubdomain'):
                #         if subdomain_url:
                #             contributing_subdomains.append({
                #                 'url': urldefrag(subdomain_url.DataUrl.text).url,
                #                 'reach_pct': float(subdomain_url.Reach.Percentage.text[:-1]) if subdomain_url.Reach.Percentage.text and subdomain_url.Reach.Percentage.text != '0' else 0.0,
                #                 'page_views_pct': float(subdomain_url.PageViews.Percentage.text[:-1]) if subdomain_url.PageViews.Percentage.text else 0.0,
                #                 'page_views_per_usr': float(subdomain_url.PageViews.PerUser.text)
                #             })

                #     for domain in content_data.find_all('OwnedDomains'):
                #         if domain.OwnedDomain:
                #             other_owned_domains.append({
                #                 'url': urldefrag(domain.OwnedDomain.Domain.text).url,
                #                 'title': domain.OwnedDomain.Title.text,
                #             })

                #     for country in url_info.find_all('Country'):
                #         page_views_pct = country.Contribution.PageViews.text[:-1]
                #         users_pct = country.Contribution.Users.text[:-1]

                #         ranks_by_country.append({
                #             'country_code': country['Code'],
                #             'rank': int(country.Rank.text) if country.Rank.text else 0,
                #             'page_views_pct': float(page_views_pct) if page_views_pct else 0.0,
                #             'users_pct': float(users_pct) if users_pct else 0.0
                #         })

                #     source_info = {
                #         'domain': source.domain,
                #         'brand': source.brand,
                #         'description': source.description,
                #         'contact_us_url': urldefrag(contact_us_url).url,
                #         'about_us_url': urldefrag(about_us_url).url,
                #         'alexa_rank': int(traffic_data.Rank.text) if traffic_data.Rank.text else 0,
                #         'alexa_title': content_data.SiteData.Title.text,
                #         'alexa_description': content_data.SiteData.Description.text if content_data.SiteData.Description else '',
                #         'links_in_count': int(content_data.LinksInCount.text) if content_data.LinksInCount.text else 0,  # A count of links pointing in to this site
                #         'spd_median_load_time': int(content_data.Speed.MedianLoadTime.text) if content_data.Speed.MedianLoadTime.text else 0,
                #         'spd_percentile': int(content_data.Speed.Percentile.text) if content_data.Speed.Percentile.text else 0,
                #         'category_title': category.Title.text if category and category.Title else '',
                #         'category_abs_path': category.AbsolutePath.text if category and category.AbsolutePath else '',
                #         'date_created': content_data.SiteData.OnlineSince.text if content_data.SiteData.OnlineSince else '00/00/0000',
                #         'ranks_by_country': ranks_by_country,
                #         'related_links': related_links,
                #         'contributing_subdomains': contributing_subdomains,
                #         'owned_domains': other_owned_domains  # Other domains owned by the same owner as this site
                #     }

                # if source_info:
                #     print('Source Information: ' + json.dumps(source_info, indent=2))

                for article in source.articles:
                    start_time = time.clock()
                    sleep()

                    if any(na['url'] == urldefrag(article.url).url or na['url'] == urldefrag(article.url).url[:urldefrag(article.url).url.find('?')] for na in news_articles):
                        print('\n(EXISTING URL) Skipped: ' + str(article.url) + '\n')
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
                            'url': urldefrag(article.url).url,
                            'title': article.title.encode('ascii', 'ignore').decode('utf-8'),
                            'authors': article.authors,
                            'text': article.text.encode('ascii', 'ignore').decode('utf-8').replace('\n', ''),
                            'publish_date': article.publish_date.strftime('%m/%d/%Y') if article.publish_date else '',
                            'top_image': article.top_image,
                            'source': source_info
                            # 'images': article.images,
                            # 'movies': article.movies
                        }

                        news_articles.append(new_article)
                        count += 1

                        print(str(count) + '.) ' + str(article.title) + ' | ' + str(article.url))
                        print('-- ' + str('%.2f' % float(time.clock() - start_time)) + 's scraping runtime')

                        with open(folder_path + '/articles.json', 'w+') as json_file:
                            json.dump(news_articles, json_file, indent=2, sort_keys=True, default=str)

                    except newspaper.ArticleException as e:
                        print('\n(ARTICLE ERROR) Article Skipped\n')
                        print(e)
                        continue

            print('\n' + source.domain + ' done!')

scrape(sys.argv[1])
