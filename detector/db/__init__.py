import rethinkdb as r
import os

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)


def get_articles(mapArticle, score_threshold=0,isReliable=True):
    return list(
        r.table('articles').eq_join('sourceId', r.table('sources')).filter(
            r.row['right']['isReliable'].eq(isReliable).and_(r.row['left']['categories'].nth(0).get_field('score').ge(score_threshold))).map(mapArticle).run(
                conn))
