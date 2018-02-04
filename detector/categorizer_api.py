import pickle
from flask import Flask, request, jsonify

clf = pickle.load(open('categorizer.pkl', 'rb'))

app = Flask(__name__)

a = """
University of the Philippines started its new era under new Kenyan head coach Godfrey Okumu with a 25-19, 25-13, 21-25, 16-25, 15-8 win over University of the East in the UAAP Season 80 women’s volleyball tournament Sunday at Mall of Asia Arena.

The Lady Maroons survived their disastrous performance in the third and fourth sets where majority of their 46 errors occurred and buckled down in the fifth set.

Nursing an 8-6 lead in the final period, UP built an 11-7 buffer off Justine Dorog’s kill.

Isa Molde then, scored two of the Lady Maroons’ final three points to secure the victory.

“I’d just like to say that UE played well, we put the pressure on them but we relaxed,” said Okumu. “You saw in the fifth set that we fought back, our defense came back.”

“I told my players that if they pass well they will execute well and if they can defend well they will score.”

Diana Carlos and Molde led with UP with 22 and 20 points, respectively, the first time that the duo both scored at least 20 in the same game.

Judith Abil led UE with 12 points while Mary Ann Mendrez added 10.
"""

pred_proba = clf.predict_proba([a])[0]

res = []

for i in range(len(clf.classes_)):
    res.append({'label': clf.classes_[i], 'score': pred_proba[i]})
res = sorted(res, key=lambda cat: cat['score'], reverse=True)
print(res)

@app.route('/predict', methods=['POST'])
def predict():
   body = request.json
