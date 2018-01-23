from db import get_articles

articles = get_articles(lambda join: {
  'body': join['left']['body']
})
