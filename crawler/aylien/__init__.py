import os
from aylienapiclient import textapi

AYLIEN_APP_ID = os.environ.get('AYLIEN_APP_ID')
AYLIEN_APP_KEY = os.environ.get('AYLIEN_APP_KEY')
AYLIEN_APP_ID2 = os.environ.get('AYLIEN_APP_ID2')
AYLIEN_APP_KEY2 = os.environ.get('AYLIEN_APP_KEY2')
AYLIEN_APP_ID3 = os.environ.get('AYLIEN_APP_ID3')
AYLIEN_APP_KEY3 = os.environ.get('AYLIEN_APP_KEY3')
FAKE_AYLIEN_APP_ID = os.environ.get('FAKE_AYLIEN_APP_ID')
FAKE_AYLIEN_APP_KEY = os.environ.get('FAKE_AYLIEN_APP_KEY')
FAKE_AYLIEN_APP_ID2 = os.environ.get('FAKE_AYLIEN_APP_ID2')
FAKE_AYLIEN_APP_KEY2 = os.environ.get('FAKE_AYLIEN_APP_KEY2')
FAKE_AYLIEN_APP_ID3 = os.environ.get('FAKE_AYLIEN_APP_ID3')
FAKE_AYLIEN_APP_KEY3 = os.environ.get('FAKE_AYLIEN_APP_KEY3')

text_client = textapi.Client(AYLIEN_APP_ID, AYLIEN_APP_KEY)
text_client2 = textapi.Client(AYLIEN_APP_ID2, AYLIEN_APP_KEY2)
text_client3 = textapi.Client(AYLIEN_APP_ID3, AYLIEN_APP_KEY3)

fake_text_client = textapi.Client(FAKE_AYLIEN_APP_ID, FAKE_AYLIEN_APP_KEY)
fake_text_client2 = textapi.Client(FAKE_AYLIEN_APP_ID2, FAKE_AYLIEN_APP_KEY2)
fake_text_client3 = textapi.Client(FAKE_AYLIEN_APP_ID3, FAKE_AYLIEN_APP_KEY3)

classes = [
    'Economy', 'Business & Finance', 'Lifestyle', 'Disaster & Accident',
    'Entertainment & Arts', 'Sports', 'Law & Government', 'Politics', 'Health',
    'Science & Technology', 'Crime', 'Weather',
    'Environment'
    #'Culture', #'Nation',
]


def article_extraction(url):
    return text_client3.Extract({'url': url})['article']


def get_rate_limits(use_fake_keys=False):
    if use_fake_keys:
        aylien_status = text_client.RateLimits()
        aylien_status2 = text_client2.RateLimits()
        aylien_status3 = text_client3.RateLimits()
    else:
        aylien_status = fake_text_client.RateLimits()
        aylien_status2 = fake_text_client2.RateLimits()
        aylien_status3 = fake_text_client3.RateLimits()

    return [aylien_status, aylien_status2, aylien_status3]


def categorize(url, use_fake_keys=False):
    categories = []

    try:
        if use_fake_keys:
            category1 = fake_text_client.UnsupervisedClassify({
                'url': url,
                'class': classes[:5]
            })

            category2 = fake_text_client2.UnsupervisedClassify({
                'url': url,
                'class': classes[5:10]
            })
            category3 = fake_text_client3.UnsupervisedClassify({
                'url': url,
                'class': classes[10:]
            })
        else:
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

        body = category1['text']

        if not body:
            return None, None

        categories = category1['classes'] + category2['classes'] + category3['classes']
        # print(categories)
        categories = [cat for cat in categories if cat['score'] != None and cat['score'] > 0]
        categories = sorted(
            categories, key=lambda c: c['score'], reverse=True)

        return categories, body

    except Exception as e:
        print(e)
        return 'API LIMIT', None
