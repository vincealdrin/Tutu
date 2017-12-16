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

def insert_article(article, table='articles'):
    r.table(table).insert({
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

def get_article(id, table='articles'):
    return r.table(table).get(id).run(conn)

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

def get_sources_count(table='sources'):
    return r.table(table).count().run(conn)

def get_sources(order_by, desc = False, table='sources'):
    if desc:
        return list(r.table(table).order_by(r.desc(order_by)).run(conn))
    return list(r.table(table).order_by(order_by).run(conn))

def get_rand_sources(not_sources=[], count = 1, table='sources'):
    return list(
        r.table(table)
            .filter(
                lambda source: (~r.expr(not_sources).contains(source['id']))
            )
            .sample(count)
            .run(conn)
        )

def insert_fake_source(source):
    r.table('fakeSources').insert(source).run(conn)

def get_source(id, table='sources'):
    return r.table(table).get(id).run(conn)
