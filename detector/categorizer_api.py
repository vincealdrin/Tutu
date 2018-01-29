import pickle
from flask import Flask, request, jsonify

clf = pickle.load(open('categorizer.pkl', 'rb'))

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
   body = request.json

