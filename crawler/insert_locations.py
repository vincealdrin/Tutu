import rethinkdb as r
import os
import json
from dotenv import load_dotenv, find_dotenv
from db import get_all, check_has_same_loc, update_article_field

load_dotenv(find_dotenv(), override=True)

DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

conn = r.connect(DB_HOST, DB_PORT, db=DB_NAME)

with open('./locations-ph.json') as locations_data:
    locations = json.load(locations_data)

with open('./provinces-capital-ph.json') as provinces_data:
    provinces = json.load(provinces_data)

for location in locations:
    prov = location['province']
    loc_id = r.uuid(location['formattedAddress']).run(conn)
    r.table('locations').insert({
        'id':
        loc_id,
        "name":
        location['name'],
        "type":
        location['type'],
        "brgyCount":
        int(location['brgyCount']),
        "area":
        location['area'],
        "psgc":
        location['psgc'],
        "formattedAddress":
        location['formattedAddress'],
        "position":
        r.point(location['coordinates']['longitude'],
                location['coordinates']['latitude']),
        "province":
        location['province'],
        "region":
        location['region'],
    }).run(conn)

locations = get_all('locations')

for location in locations:
    res = check_has_same_loc(location['name'])

    update_article_field(location['id'], 'hasSameName', res['has_same_name'], tbl='locations')


for province in provinces:
    p_id = r.uuid(province['ISO']).run(conn)

    capital = r.table('locations').filter(r.row['name'].eq(
        province['capital']).and_(r.row['province'].eq(
            province['name']))).nth(0).run(conn)

    r.table('provinces').insert({
        "ISO": province['ISO'],
        "name": province['name'],
        "capital": province['capital'],
        "area": province['area'],
        "division": province['division'],
        "region": province['region'],
        "townCount": province['townCount'],
        "brgyCount": int(province['brgyCount']),
        "cityCount": province['cityCount'],
        "capitalId": capital['id'],
        'id': p_id
    }).run(conn)

    r.table('locations').filter(r.row['province'].eq(province['name'])).update({
        'provinceId': p_id
    }).run(conn)
    r.table('locations').filter(r.row['province'].eq(province['name'])).replace(
        r.row.without('province')).run(conn)
