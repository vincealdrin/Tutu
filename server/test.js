const { getAlexaRank } = require('./utils');

(async () => {
  console.log(await getAlexaRank('facebook.com'));
})();
