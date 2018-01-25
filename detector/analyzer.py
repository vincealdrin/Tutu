from db import get_articles
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from nltk.stem.snowball import SnowballStemmer
import pandas as pd

articles = get_articles(lambda join: {
  'body': join['left']['body'],
  'title': join['left']['title'],
  'credible':join['right']['isReliable']
})

df = pd.DataFrame.from_records(articles)

a = df[df['credible'] == True]

print(a.head())

# X_train, X_test, y_train, y_test = train_test_split(
#     df.body.values, df.credible.values, test_size=0.05, random_state=123)

# clf = Pipeline([
#   ('tfidf',
#      TfidfVectorizer(
#          stop_words=ENGLISH_STOP_WORDS,
#          ngram_range=(1, 2),
#          max_df=0.85,
#          min_df=0.01)),
#      ('clf', MultinomialNB(fit_prior=False)),
# ])

# clf.fit(X_train, y_train)

# prediction = clf.predict(X_test)

# print(accuracy_score(y_test, prediction))


# a = """
# NCRPO Capital Region Police Officer Director Chief Supt. Oscar Albayalde ordered the relief of Senior Supt. Marcelino Pedrozo and eight MPD officers involved in the violent dispersal of rally at the US Embassy in Manila Wednesday.

# According to some witnesses, Pedrozo was heard telling his men to disperse the protesters after they managed to go near the US Embassy.

# “Wala man lang kayong hinuli, ang dami-dami niyan… Magkagulo na kung magkagulo, pulis tayo rito e. Pwede ba tayong patalo sa mga yan? Anong mukhang ihaharap natin sa embassy? Kaya i-disperse mo ‘yan,” Pedrozo told an officer at the area.

# “Lumaban kasi kayo! Mga pulis kayo hindi kayo lumalaban!” he added, this time addressing the anti-riot policemen.

# But a day after the dispersal, Pedrozo denied that he ordered the dispersal and he defended the side of his team.

# According to him, the violence was started by the rallyist and the cop who operated the police mobile that rammed the rallyist only intended to remove the car from the area because the people are trying to destroy it.

# The team of Pedrozo received criticisms on social media, saying that they destroyed the image of the Philippine National Police.
# """

# s = clf.predict([a])[0]

# print(s)
