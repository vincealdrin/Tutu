
import json
import rethinkdb as r
import requests
from dotenv import load_dotenv, find_dotenv
from db import insert_fake_source
import time

load_dotenv(find_dotenv(), override=True)

with open('../fake-news-detector/fake-news-sources/fake-news-sources.json') as f:
  sources = json.load(f)

# headers = {'Content-Type': 'application/json', 'Accept':'application/json'}
# for s in sources:
#   for url in s['urls']:
#     requests.post('http://localhost:3001/api/sources', data=json.dumps([url]), headers=headers)
#     time.sleep(1)
