import rethinkdb as r
import os

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)


def get_articles_filtered(mapArticle, score_threshold=0, isReliable=True):
    return list(
        r.table('articles').eq_join('sourceId', r.table('sources')).filter(
            r.row['right']['isReliable'].eq(isReliable).and_(r.row['left']['categories'].nth(0).get_field('score').ge(score_threshold))).map(mapArticle).run(
                conn))

def get_articles(mapArticle):
    return list(
        r.table('articles').eq_join('sourceId', r.table('sources')).map(mapArticle).run(
                conn))

def get_sources_sample(pct):
    return list(
        r.table('sources').sample(r.round(r.expr(pct/100).mul(r.table('sources').count()))).get_field('id').run(
                conn))
