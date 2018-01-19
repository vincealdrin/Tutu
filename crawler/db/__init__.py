import rethinkdb as r
import os
from datetime import datetime, timedelta
from utils import PH_TIMEZONE, TWO_DAYS_IN_SEC
from random import randrange
from similar_text import similar_text

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)


def get_uuid(text):
    return r.uuid(text).run(conn)


def insert_article(article, reliable=True):
    # article = {
    #     **article,
    #     # 'id': r.expr(article['id']),
    #     # 'categories': r.expr(article['categories']),
    #     # 'publishDate': r.expr(article['publishDate']),
    #     'timestamp': r.expr(datetime.now(r.make_timezone(PH_TIMEZONE))),
    # }
    article['timestamp'] = r.expr(datetime.now(r.make_timezone(PH_TIMEZONE)))

    rel_articles = r.table('articles').eq_join('sourceId', r.table('sources')).filter(lambda doc:
        doc['left']['id'].ne(article['id']) & doc['left']['publishDate'].date().during(
            r.time(article['publishDate'].year(), article['publishDate'].month(), article['publishDate'].day(), PH_TIMEZONE).sub(TWO_DAYS_IN_SEC),
            r.time(article['publishDate'].year(), article['publishDate'].month(), article['publishDate'].day(), PH_TIMEZONE).add(TWO_DAYS_IN_SEC),
            right_bound='closed'
        ).and_(
            r.expr(article['categories']).slice(0, 2).get_field('label').contains(
                lambda label: doc['left']['categories'].slice(0, 2).get_field('label').contains(label)).and_(
                        r.or_(
                            # r.expr(article['topics']['common']).contains(lambda keyword:
                            #     doc['left']['topics']['common'].coerce_to('string').match(keyword)),
                        r.expr(article['people']).contains(lambda person:
                            doc['left']['people'].coerce_to('string').match(person)),
                        r.expr(article['organizations']).contains(lambda org:
                            doc['left']['organizations'].coerce_to('string').match(org))
                        ))
        ).and_(doc['right']['isReliable'].eq(reliable))).order_by(r.desc('publishDate')).slice(0, 10).map(lambda join: {
            'id': join['left']['id'],
            'title': join['left']['title'],
        }).run(conn)

    # print([rel['title'] for rel in rel_articles])

    rel_articles = [
        rel for rel in list(rel_articles)
        if similar_text(article['title'], rel['title']) > 35
    ]
    # print([rel['title'] for rel in rel_articles])

    rel_ids = [rel['id'] for rel in rel_articles]

    for rel in rel_articles:
        del rel['title']

    article['relatedArticles'] = rel_ids

    # print(article)

    r.table('articles').get_all(r.args(rel_ids)).update(lambda doc:
        r.branch(
            doc['relatedArticles'].contains(article['id']),
            {'relatedArticles': doc['relatedArticles']},
            {'relatedArticles': doc['relatedArticles'].prepend(article['id'])}
        )
    ).run(conn)

    r.table('articles').insert(article).run(conn)


def insert_log(sourceId, log_type, status, runTime, info):
    r.table('crawlerLogs').insert({
        **info,
        'sourceId': sourceId,
        'status': status,
        'type': log_type,
        'runTime': runTime,
        'timestamp': r.expr(datetime.now(r.make_timezone(PH_TIMEZONE)))
    }).run(conn)

    MB = 1024
    THRESHOLD = 50
    logs_mb_size = r.db('rethinkdb').table('stats').filter({
        'db':
        'tutu',
        'table':
        'crawlerLogs'
    }).map(r.row['storage_engine']['disk']['space_usage']['data_bytes']
           .default(0)).sum().div(MB).div(MB).run(conn)

    # print('Logs MB size: '+str(logs_mb_size))
    if logs_mb_size > THRESHOLD:
        r.table('crawlerLogs').delete().run(conn)
        print('LOGS DELETED')

    # DAYS = 1
    # HOURS = 1
    # last_days = datetime.now(r.make_timezone(PH_TIMEZONE)) - timedelta(days=DAYS)
    # last_hours = datetime.now(r.make_timezone(PH_TIMEZONE)) - timedelta(hours=HOURS)

    # r.table('crawlerLogs').filter(
    #     r.row['timestamp'].le(last_days).or(
    #         r.row['type'].eq('sourceCrawl').and(
    #             r.row['status'].eq('error').and(
    #                 r.row['errorMessage'].eq('ZERO ARTICLES')
    #             )
    #         ).and(
    #             r.row['timestamp'].le(last_hours)
    #         )
    #     )).delete().run(conn)

    return randrange(2, 6)


def get_one(item_id, tbl):
    return r.table(tbl).get(item_id).run(conn)


def get_all(tbl):
    return list(r.table(tbl).run(conn))


def get_count(tbl):
    return r.table(tbl).count().run(conn)


def insert_item(item, tbl):
    r.table(tbl).insert(item).run(conn)


def get_locations():
    return list(
        r.table('locations').eq_join('provinceId', r.table('provinces')).merge(lambda doc:
            {
                'location': doc['left'].without({
                    'id': True,
                    'area': True,
                    'brgyCount': True,
                    'provinceId': True,
                    'psgc': True,
                }),
                'province': doc['right'].without({
                    'id': True,
                    'area': True,
                    'brgyCount': True,
                    'capitalId': True,
                    'townCount': True,
                    'cityCount': True
                })
            }).without({ 'right': True, 'left': True }).run(conn))


def get_provinces():
    return list(
        r.table('provinces').eq_join('capitalId', r.table('locations')).merge(lambda doc:
            {
                'province': doc['left'].without({
                    'id': True,
                    'area': True,
                    'brgyCount': True,
                    'capitalId': True,
                    'townCount': True,
                    'cityCount': True,
                }),
                'location': doc['right'].without({
                    'id': True,
                    'area': True,
                    'brgyCount': True,
                    'provinceId': True,
                    'psgc': True,
                    'hasSameName': True
                })
            }).without({ 'right': True, 'left': True }).run(conn))


def get_sources(order_by='timestamp',
                desc=False,
                isReliable=True,
                tbl='sources'):
    query = r.table(tbl).filter(r.row['isReliable'].eq(isReliable))

    if desc:
        return list(query.order_by(r.desc(order_by)).run(conn))
    return list(query.order_by(order_by).run(conn))


def get_rand_sources(filter_sources=[],
                     count=1,
                     isReliable=True,
                     tbl='sources'):
    return list(
        r.table(tbl)
        .filter(lambda source: r.not_(r.expr(filter_sources).contains(source['id'])).and_(source['isReliable'].eq(isReliable)))
        .sample(count).run(conn))


def update_field(pr_id, field, val, tbl='articles'):
    r.table(tbl).get(pr_id).update({field: val}).run(conn)


def check_has_same_loc(name):
    count = r.table('locations').filter(
        r.row['name'].eq(name)).count().run(conn)
    return {'has_same_name': count > 1, 'count': count}
