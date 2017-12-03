const router = require('express').Router();
const api = require('./api');
const exposed = require('./exposed');
const r = require('rethinkdb');

module.exports = (conn) => {
  router.use('/api', api(conn));
  router.use('/exposed', exposed(conn));
  router.get('/test', (req, res) => {
    const keywords = rake.generate('Senator Grace Poe has vowed to listen to the concerns of drivers after an anti-jeepney phase-out coalition heeded her call to call off its nationwide transport strike set for Dec. 4 and 5.“We welcome the decision of Piston (Pinagkaisang Samahan ng Tsuper at Opereytor Nationwide) and No to Jeepney Phaseout Coalition to heed our appeal and call off their nationwide transport strike,” Poe, chair of the Senate public services committee, said in a statement on Sunday.Instead of a gearing for a transport holiday, the senator invited the groups to attend a Senate inquiry into the issues of the public transportation sector on Dec. 7.“Issues can be better discussed and resolved when sobriety and judiciousness are exercised, in pursuit of the highest public good,” Poe said.“As I have committed, I will call a hearing to discuss with all stakeholders issues confronting the transport sector, including the planned jeepney modernization program with the view of addressing their concerns,” she added.The lawmaker said it was time to take into consideration the concerns of jeepney drivers, operators, and commuters in order to find a solution to the country’s transport woes.“We shall be guided by reason, responsibility and public welfare,” Poe said.“Hindi na kailangang magdusa pa ang ating mga kababayang nakaasa sa pampublikong transportasyon,” she added.The No to Jeepney Phase-out Coalition led by Piston announced on Sunday the cancellation of its two-day transport strike to give way to Poe’s request and to prepare for a bigger protest action in January next year.');

    res.json(keywords);
  });
  return router;
};
