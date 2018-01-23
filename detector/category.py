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
    'category': join['left']['categories'].nth(0).get_field('label')
})[:-9]
print(len(articles))

title_tfidf = TfidfVectorizer(
    stop_words=ENGLISH_STOP_WORDS,
    ngram_range=(1, 3),
    max_df=0.85,
    min_df=0.01)

df = pd.DataFrame.from_records(articles)

df = pd.concat([
    df[df['category'] == 'Business & Finance'][:43],
    df[df['category'] == 'Lifestyle'][:43],
    df[df['category'] == 'Disaster & Accident'][:43],
    df[df['category'] == 'Entertainment & Arts'][:43],
    df[df['category'] == 'Sports'][:43],
    df[df['category'] == 'Law & Government'][:43],
    df[df['category'] == 'Politics'][:43],
    df[df['category'] == 'Health'][:43],
    df[df['category'] == 'Crime'][:43],
    df[df['category'] == 'Culture'][:43],
    df[df['category'] == 'Weather'][:43],
    df[df['category'] == 'Environment'][:43],
    df[df['category'] == 'Science & Technology'][:43],
])


X_train, X_test, y_train, y_test = train_test_split(
    df.body.values, df.category.values, test_size=0.05, random_state=123)

text_clf = Pipeline([
    ('tfidf',
     TfidfVectorizer(
         stop_words=ENGLISH_STOP_WORDS,
         ngram_range=(1, 2),
         max_df=0.85,
         min_df=0.01)),
    ('clf', MultinomialNB(fit_prior=False)),
])

text_clf.fit(X_train, y_train)

prediction = text_clf.predict(X_test)

counter = 0

for i in range(len(prediction)):
    if prediction[i] != y_test[i]:
        counter = counter + 1

print(counter)
print(accuracy_score(y_test, prediction))

a = """
OUR natural ecosystems have been severely disturbed or even damaged that they cannot function well. We need to restore them as much as possible to their original conditions so that they can withstand heavy rainfall during typhoons.

On land, we have the tropical rainforest that has been reduced to less than 10 percent of its original area, which used to be 60% of the total land area of the Philippines. Now, it has been reduced to less than 10%. Experts think that 30-40% of a country should be forest. Because of this much reduced forest cover, it is not surprising that flooding and landslides have become common occurrence in the country, with heavy loss of life and property.

There are some people who claim that floods are due to rainfall alone, and the presence of forests has no effect on flooding. But I disagree. I have observed the rainforests on Negros in the 1940s and in the 1950s during our field work that required searching for borrowing reptile species on the forest floor where there was a thick layer of humus and decaying leaves and tree branches. These organic materials should have absorbed the rain water and is the reason why even in the dry season, the forest floor remains moist or wet and cool. In a forest at 400 meters altitude in southern Negros, the moist to wet forest floor had temperatures of 20.5 to 23.7 degrees Celsius in December. The air temperatures in the rainforest studied was 20.9 to 24.7 degrees Celsius. Both substrate and air temperatures are expected to be higher during the rest of the months by 2 to 4 degrees Celsius.

The rainforest in the lowlands is typically three-layered and practically no sunlight can penetrate to the forest floor, which is usually devoid of undergrowth except for a few seedlings. It is quite clear that the tropical rainforest that we studied had stable temperatures comfortable to humans and to other animal species in the forest as well. Other lowland rainforests in the country are expected to have similar environmental conditions.

Tropical rainforests are home to our native animal species. There are more of these species inhabiting rainforests than any other terrestrial ecosystem. For example, 80% of the almost 400 species of Philippine amphibians and reptiles inhabit rainforests. This is because of the stable environmental conditions in these forests. As mentioned above, there are only slight variations in microclimate in the various microhabitats in these forests. These favourable conditions partly explain why the majority of our biodiversity species, such as land vertebrates, are found in rainforests.

We must exert effort to restore our tropical rainforests for the new generations of our people (who may not have seen these forests) to appreciate and enjoy the many ecological services that rainforests provide. It is time to conserve what remains of this forest. The tendency of some of our people to log our remaining rainforests must stop. Many people are beginning to plant Philippine endemic species of trees. Now is the time to do all these activities because forest tree species take several decades to develop and become part of climax tropical rainforests and their associated biodiversity. In the process of restoring our forests, we must avoid propagating exotic species, which are harmful to the normal functioning of our forest ecosystems.
"""

res = []

# for i in range(len(text_clf.classes_)):
#     print(text_clf.classes_[i] + ': ' + str(text_clf.predict_proba([a])[0][i]))

pred_proba = text_clf.predict_proba([a])[0]

for i in range(len(text_clf.classes_)):
    res.append({'label': text_clf.classes_[i], 'score': pred_proba[i]})

res = sorted(res, key=lambda cat: cat['score'], reverse=True)
print(res)
