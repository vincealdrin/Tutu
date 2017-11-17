const awis = require('awis');
require('dotenv').config();

const awisClient = awis({
  key: process.env.AMAZON_ACCESS_KEY,
  secret: process.env.AMAZON_SECRET_KEY,
});

const responseGroups = ['RelatedLinks', 'Categories', 'Rank', 'ContactInfo', 'RankByCountry',
  'UsageStats', 'Speed', 'Language', 'OwnedDomains', 'LinksInCount',
  'SiteData', 'AdultContent',
];

awisClient({
  Action: 'UrlInfo',
  Url: 'http://inquirer.net',
  ResponseGroup: responseGroups.join(),
}, (err, info) => {
});
