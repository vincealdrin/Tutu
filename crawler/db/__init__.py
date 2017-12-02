from dotenv import load_dotenv, find_dotenv
import rethinkdb as r
import os
from datetime import datetime
from utils import PH_TIMEZONE
from random import randrange

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)

def get_uuid(text):
    return r.uuid(text).run(conn)

def insert_article(article):
    r.table('articles').insert({
        **article,
        'timestamp': r.expr(datetime.now(r.make_timezone(PH_TIMEZONE))),
    }).run(conn)

def insert_log(sourceId, type, status, runtime, info):
    r.table('crawlerLogs').insert({
        **info,
        'sourceId': sourceId,
        'status': status,
        'type': type,
        'runtime': runtime,
        'timestamp': r.expr(datetime.now(r.make_timezone(PH_TIMEZONE)))
    }).run(conn)

    return randrange(2, 6)

def get_article(id):
    return r.table('articles').get(id).run(conn)

def get_locations():
    return list(
        r.table('locations').eq_join('provinceId', r.table('provinces')).merge(lambda doc:
            {
                'location': doc['left'].without({ 'area': True, 'brgyCount': True, 'provinceId': True , 'psgc': True}),
                'province': doc['right'].without({ 'area': True, 'brgyCount': True, 'capitalId': True, 'townCount': True, 'cityCount': True })
            }).without({ 'right': True, 'left': True }).run(conn))

    return locations

def get_provinces():
    return list(
        r.table('provinces').eq_join('capitalId', r.table('locations')).merge(lambda doc:
            {
                'province': doc['left'].without({ 'area': True, 'brgyCount': True, 'capitalId': True, 'townCount': True, 'cityCount': True }),
                'location': doc['right'].without({ 'area': True, 'brgyCount': True, 'provinceId': True , 'psgc': True})
            }).without({ 'right': True, 'left': True }).run(conn))

def get_news_sources(order_by, desc):
    if desc:
        return list(r.table('sources').order_by(r.desc(order_by)).run(conn))
    return list(r.table('sources').order_by(order_by).run(conn))

