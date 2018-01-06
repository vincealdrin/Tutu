r.db('tutu').table('articles').eqJoin('sourceId', r.db('tutu').table('sources'))
  .map(article => (
    {
      title: article('left')('title'),
      body: article('left')('body'),
      sentiment: r.branch(
        article('left')('sentiment')('compound') >= 0.5,
        0,
        article('left')('sentiment')('compound') <= 0.5,
        1,
        2
      ),
      socialScore: article('left')('popularity')('totalScore'),
      hasTopImage: r.branch(
        article('left')('topImageUrl'),
        1,
        0
      ),
      sourceHasAboutPage: r.branch(
        article('right')('aboutUsUrl'),
        1,
        0
      ),
      sourceHasContactPage: r.branch(
        article('right')('contactUsUrl'),
        1,
        0
      ),
      sourceSocialScore: article('right')('socialScore'),
      sourceCountryRank: article('right')('rankByCountry').filter(c => c('code').eq('PH'))('rank').nth(0).default(0),
      sourceWorldRank: article('right')('rank')
    }))
