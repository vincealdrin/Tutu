import json
import time
import requests
from lxml import etree
from db import insert_fake_source, get_uuid
from utils import get_popularity

with open(
        '../fake-news-detector/fake-news-sources/fake-news-sources.json') as f:
    SOURCES = json.load(f)

HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}
for s in SOURCES:
    for url in s['urls']:
        xml_str = requests.get('http://data.alexa.com/data?cli=10&url=' + url)
        tree = etree.fromstring(xml_str.text.encode('utf-8'))
        etree.strip_tags(tree, etree.Comment)

        world_rank = -1
        country_rank = -1
        for x in tree.xpath('/ALEXA/SD/POPULARITY'):
            world_rank = int(x.get('TEXT')) if x.get('TEXT') else -1
        for x in tree.xpath('/ALEXA/SD/COUNTRY'):
            country_rank = int(x.get('RANK')) if x.get('RANK') else -1
        meta = requests.get(
            'http://localhost:5000/api/exposed/submit?url=http://' + url).json(
            )
        print(meta)
        info = {
            'id':
            get_uuid(url),
            'url':
            url,
            'socialScore':
            get_popularity('http://' + url)['totalScore'],
            'worldRank':
            world_rank,
            'countryRank':
            country_rank,
            'hasAboutPage':
            1
            if meta['aboutUsUrl'] not in ['http://#', 'https://#', ''] else 0,
            'hasContactPage':
            1
            if meta['contactUsUrl'] not in ['http://#', 'https://#', ''] else 0
        }

        print(info)

        insert_fake_source(info)

        time.sleep(1)
