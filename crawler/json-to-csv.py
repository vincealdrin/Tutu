import json
import pandas

with open('./fake-news.json') as fake_news_json:
    fake_news = json.load(fake_news_json)
    data = []

    for news in fake_news:
        data.append({
            'has_author': 1 if len(news['authors']) else 0,
            'has_site_description': 1 if news['source']['alexa_description'] or news['source']['description'] else 0,
            'has_about_page': 1 if news['source']['about_us_url'] else 0,
            'has_contact_page': 1 if news['source']['contact_us_url'] else 0,
            'has_alexa_category': 1 if news['source']['category_title'] or news['source']['category_abs_path'] else 0,
            'has_top_image': 1 if news['top_image'] else 0,
            'is_categorized_by_alexa': 1 if len(news['source']['related_links']) else 0,
            'site_spd_median_load_time': news['source']['spd_median_load_time'],
            'site_spd_percentile': news['source']['spd_percentile'],
            'site_rank': news['source']['alexa_rank'],
            'site_ph_rank': next(rank for rank in news['source']['ranks_by_country'] if rank['country_code'] == 'PH')['rank'] if len(news['source']['ranks_by_country']) else 0,
            'site_links_in_count': news['source']['links_in_count'],
            'title': news['title'],
            'text': news['text'],
            # 'site_description': news['source']['alexa_description'] if news['source']['alexa_description'] else news['source']['description'],
            'reliable': 0
        })

    df = pandas.DataFrame.from_records(data)
    df.to_csv('./fake-news.csv', index=False)