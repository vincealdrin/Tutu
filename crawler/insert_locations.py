import rethinkdb as r
from dotenv import load_dotenv, find_dotenv
import os
import json

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
  del location['province']
  loc_id = r.uuid(location['formattedAddress']).run(conn)

  a = r.table('locations').insert({
    "name": location['name'],
    "type": location['type'],
    "brgyCount": int(location['brgyCount']),
    "area": location['area'],
    "psgc": location['psgc'],
    "formattedAddress": location['formattedAddress'],
    "position": r.point(location['coordinates']['longitude'], location['coordinates']['latitude']),
    "region": location['region'],
    'id': loc_id
  }).run(conn)

  for province in provinces:
    if (prov == province['name'] and location['name'] == province['capital']):
      p_id = r.uuid(province['ISO']).run(conn)
      b = r.table('provinces').insert({
        "ISO": province['ISO'],
        "name": province['name'],
        "capital": province['capital'],
        "area": province['area'],
        "division": province['division'],
        "region": province['region'],
        "townCount": province['townCount'],
        "brgyCount": int(province['brgyCount']),
        "cityCount": province['cityCount'],
        "capitalId": loc_id,
        'id': p_id
      }).run(conn)

  r.table('locations').get(loc_id).update({ 'provinceId': p_id }).run(conn)

