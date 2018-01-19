import json
import time
import requests
import rethinkdb as r
from lxml import etree
from db import insert_item, get_uuid
from urllib.parse import urlparse
from utils import get_popularity, clean_url

with open('../detector/data/fake-news-sources.json') as f:
    SOURCES = json.load(f)

HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}
for s in SOURCES:
    for url in s['urls']:
        url = 'http://' + url

        xml_str = requests.get('http://data.alexa.com/data?cli=10&url=' + url)
        tree = etree.fromstring(xml_str.text.encode('utf-8'))
        etree.strip_tags(tree, etree.Comment)

        world_rank = 0
        country_rank = 0
        domain = url.replace(urlparse(url).path, '')

        for x in tree.xpath('/ALEXA/SD/POPULARITY'):
            world_rank = int(x.get('TEXT')) if x.get('TEXT') else 0
            domain = x.get('URL') if x.get('URL') else ''

        if not domain:
            for z in tree.xpath('/ALEXA/SD'):
                print(z.get('HOST'))
                domain = z.get('HOST') if z.get('HOST') else ''

        for x in tree.xpath('/ALEXA/SD/COUNTRY'):
            country_rank = int(x.get('RANK')) if x.get('RANK') else 0

        try:
            meta = requests.get(
                'http://localhost:5000/api/exposed/submit/meta?url=http://' + url
            ).json()
        except:
            meta = {
                'aboutUsUrl': '',
                'contactUsUrl': '',
            }

        info = {
            'isReliable': False,
            'id':
            get_uuid(clean_url(domain)),
            'brand': s['name'],
            'url': clean_url(domain),
            'socialScore':
            get_popularity('http://' + url)['totalScore'],
            'worldRank':
            world_rank,
            'countryRank':
            country_rank,
            'aboutUsUrl': '' if meta['aboutUsUrl'] in ['http://#', 'https://#'] else meta['aboutUsUrl'],
            'contactUsUrl':'' if meta['contactUsUrl'] in ['http://#', 'https://#'] else meta['contactUsUrl'],
            'faviconUrl': '',
            'title': '',
            "verifiedByUserId": "c7d23f36-ca28-53fc-bbeb-5de9a4b05d6a",
            'timestamp': r.now().in_timezone('+08:00')
        }

        print(clean_url(domain))

        insert_item(info, 'sources')

        time.sleep(1)
