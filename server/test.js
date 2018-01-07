const { getAlexaRank } = require('./utils');

(async () => {
  try {
    console.log(await getAlexaRank('facebook.com'));
  } catch (e) {
    console.log(e);
  }
})();
