from bs4 import BeautifulSoup
import time
from requests import get
import re
import rethinkdb as r
from datetime import datetime
import htmldate
import os

SHARED_COUNT_API_KEY = os.environ.get('SHARED_COUNT_API_KEY')
PH_TIMEZONE = '+08:00'
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

def sleep(slp_time):
    if slp_time:
        print('\n> ' + str(slp_time) + 's sleep...\n')
        time.sleep(slp_time)


def get_shared_count(url):
    return get('https://api.sharedcount.com/v1.0/', {
        'url': url,
        'apikey': SHARED_COUNT_API_KEY
    }).json()


def search_publish_date(publish_date, html):
    if publish_date:
        return r.expr(publish_date.replace(tzinfo=r.make_timezone(PH_TIMEZONE)))

    found_date = htmldate.find_date(html)
    if found_date:
        return datetime.strptime(htmldate.find_date(html), '%Y-%m-%d').astimezone(r.make_timezone(PH_TIMEZONE))

    return None

def search_authors(html_doc):
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

def search_locations(text, locations, provinces):
    matched_locations = []

    for location in locations:
        if location['location']['name'] in text:
            province_pattern = re.compile('\W('+location['province']['name']+' Province|'+location['province']['name']+'|Metro '+location['province']['name']+'|'+location['province']['name']+')+,? ?(Philippines|PH)?\W', re.IGNORECASE)

            if province_pattern.search(text):
                matched_locations.append(location)

    if not matched_locations:
        for province in provinces:
            province_pattern = re.compile('\W('+province['province']['name']+' Province|'+province['province']['name']+'|Metro '+province['province']['name']+'|'+province['province']['name']+')+,? ?(Philippines|PH)?\W', re.IGNORECASE)
            matched = province_pattern.search(text)

            if matched:
                matched_locations.append(province)

    return matched_locations
