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



r.db('tutu').table('articles').map((article) => {
  const a = article('categories').nth(0).getField('label');
  return {
    Economy: r.branch(a.eq('Economy'), 1, 0),
    Lifestyle: r.branch(a.eq('Lifestyle'), 1, 0),
    Sports: r.branch(a.eq('Sports'), 1, 0),
    Politics: r.branch(a.eq('Politics'), 1, 0),
    Health: r.branch(a.eq('Health'), 1, 0),
    Crime: r.branch(a.eq('Crime'), 1, 0),
    Weather: r.branch(a.eq('Weather'), 1, 0),
    Culture: r.branch(a.eq('Culture'), 1, 0),
    Environment: r.branch(a.eq('Environment'), 1, 0),
    'Business & Finance': r.branch(a.eq('Business & Finance'), 1, 0),
    'Disaster & Accident': r.branch(a.eq('Disaster & Accident'), 1, 0),
    'Entertainment & Arts': r.branch(a.eq('Entertainment & Arts'), 1, 0),
    'Law & Government': r.branch(a.eq('Law & Government'), 1, 0),
    'Science & Technology': r.branch(a.eq('Science & Technology'), 1, 0)
  };
})
.reduce((left, right) => ({
  Economy: left('Economy').add(right('Economy')),
  Lifestyle: left('Lifestyle').add(right('Lifestyle')),
  Sports: left('Sports').add(right('Sports')),
  Politics: left('Politics').add(right('Politics')),
  Health: left('Health').add(right('Health')),
  Crime: left('Crime').add(right('Crime')),
  Weather: left('Weather').add(right('Weather')),
  Culture: left('Culture').add(right('Culture')),
  Environment: left('Environment').add(right('Environment')),
  'Business & Finance': left('Business & Finance').add(right('Business & Finance')),
  'Disaster & Accident': left('Disaster & Accident').add(right('Disaster & Accident')),
  'Entertainment & Arts': left('Entertainment & Arts').add(right('Entertainment & Arts')),
  'Law & Government': left('Law & Government').add(right('Law & Government')),
  'Science & Technology': left('Science & Technology').add(right('Science & Technology'))
}))
