from dotenv import load_dotenv, find_dotenv
import rethinkdb as r
import os
from random import randrange
import pandas

load_dotenv(find_dotenv(), override=True)

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)

articles = list(r.table('fakeArticles').run(conn))

df = pandas.DataFrame.from_records(articles)
df = df[['body', 'title']]

df.to_csv('./data/fake_news.csv', index=False)
