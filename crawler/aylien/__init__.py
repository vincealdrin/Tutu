from aylienapiclient import textapi
import os

AYLIEN_APP_ID = os.environ.get('AYLIEN_APP_ID')
AYLIEN_APP_KEY = os.environ.get('AYLIEN_APP_KEY')
AYLIEN_APP_ID2 = os.environ.get('AYLIEN_APP_ID2')
AYLIEN_APP_KEY2 = os.environ.get('AYLIEN_APP_KEY2')
AYLIEN_APP_ID3 = os.environ.get('AYLIEN_APP_ID3')
AYLIEN_APP_KEY3 = os.environ.get('AYLIEN_APP_KEY3')

text_client = textapi.Client(AYLIEN_APP_ID, AYLIEN_APP_KEY)
text_client2 = textapi.Client(AYLIEN_APP_ID2, AYLIEN_APP_KEY2)
text_client3 = textapi.Client(AYLIEN_APP_ID3, AYLIEN_APP_KEY3)

classes = [
    'Economy', 'Business & Finance', 'Lifestyle', 'Disaster & Accident',
    'Entertainment & Arts', 'Sports', 'Law & Government', 'Politics', 'Health',
    'Science & Technology', 'Crime', 'Weather', 'Culture', 'Nation',
    'Environment'
]


def article_extraction(url):
    return text_client3.Extract({'url': url})['article']


def get_rate_limits():
    aylien_status = text_client.RateLimits()
    aylien_status2 = text_client2.RateLimits()
    aylien_status3 = text_client3.RateLimits()

    return [aylien_status, aylien_status2, aylien_status3]


def categorize(url):
    categories = []
    category1 = text_client.UnsupervisedClassify({
        'url': url,
        'class': classes[:5]
    })
    category2 = text_client2.UnsupervisedClassify({
        'url': url,
        'class': classes[5:10]
    })
    category3 = text_client3.UnsupervisedClassify({
        'url': url,
        'class': classes[10:]
    })
    categories = category1['classes'] + category2['classes'] + category3['classes']
    categories = [cat for cat in categories if cat['score'] > 0]
    categories = sorted(
        categories, key=lambda c: c['score'], reverse=True)

    return categories, category1['text']
