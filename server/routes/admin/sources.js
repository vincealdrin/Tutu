const router = require('express').Router();
const r = require('rethinkdb');
const _ = require('lodash');
const cheerio = require('cheerio');
const rp = require('request-promise');
const {
  getAboutContactUrl,
  getFaviconUrl,
  getSourceInfo,
  getSourceBrand,
  getTitle,
  getSocialScore,
  cleanUrl,
  PH_TIMEZONE,
  putHttpUrl,
  getUpdatedFields,
} = require('../../utils');

const responseGroups = ['RelatedLinks', 'Categories', 'Rank', 'ContactInfo', 'RankByCountry',
  'UsageStats', 'Speed', 'Language', 'OwnedDomains', 'LinksInCount',
  'SiteData', 'AdultContent'];

module.exports = (conn, io) => {
  const tbl = 'sources';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      filter = '',
      search = '',
    } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    try {
      let query = r.table(tbl);

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const totalCount = await query.count().run(conn);
      const cursor = await query
        .orderBy(r.desc('timestamp'))
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
        .eqJoin('verifiedByUserId', r.table('users'))
        .map({
          brand: r.row('left')('brand'),
          timestamp: r.row('left')('timestamp'),
          url: r.row('left')('url'),
          id: r.row('left')('id'),
          verifiedBy: r.row('right')('name'),
        })
        .run(conn);
      const sources = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;

    try {
      const source = await r.table(tbl).get(sourceId).run(conn);

      return res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const sources = req.body;

    try {
      const sourcesWithId = await Promise.all(sources.map(async (source) => {
        const uuid = await r.uuid(cleanUrl(source)).run(conn);

        return {
          id: uuid,
          url: putHttpUrl(source),
        };
      }));
      const uuids = sourcesWithId.map((source) => source.id);
      const pendingCursor = await r.table('pendingSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedPendings = await pendingCursor.toArray();
      const sourceCursor = await r.table('sources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedSources = await sourceCursor.toArray();
      const fakeCursor = await r.table('fakeSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedFakes = await fakeCursor.toArray();

      if (matchedPendings.length || matchedSources.length || matchedFakes.length) {
        const errorMessage = [];

        sourcesWithId.forEach((source) => {
          const foundSource = matchedSources.find((ms) => ms.id === source.id);
          if (foundSource) {
            errorMessage.push(`${foundSource.url} already exists in list of reliable sources`);
            return;
          }

          const foundFake = matchedFakes.find((mf) => mf.id === source.id);
          if (foundFake) {
            errorMessage.push(`${foundFake.url} already exists in list of fake sources`);
            return;
          }

          const foundPending = matchedPendings.find((mp) => mp.id === source.id);
          if (foundPending) {
            errorMessage.push(`${foundPending.url} already exists in list of pending sources`);
          }
        });

        return next({
          status: 400,
          message: errorMessage,
        });
      }

      const sourcesInfo = await Promise.all(sourcesWithId.map(async (source) => {
        const cheerioDoc = cheerio.load(await rp(source.url));
        const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, source.url);
        const faviconUrl = getFaviconUrl(cheerioDoc);
        const infoPromise = await getSourceInfo(source.url, responseGroups);
        const socialScore = await getSocialScore(source.url);

        const info = await infoPromise;
        const brand = getSourceBrand(cheerioDoc) || source.url;

        delete info.contactInfo;
        const subdomains = _.get(info, 'trafficData.contributingSubdomains.contributingSubdomain') || [];
        const mappedSubdomains = Array.isArray(subdomains)
          ? subdomains.map((subdomain) => ({
            url: subdomain.dataUrl,
            pageViews: {
              perUser: parseFloat((_.get(subdomain, 'pageViews.perUser') || '0.0')),
              percentage: parseFloat((_.get(subdomain, 'pageViews.percentage') || '0.0').replace('%', '')),
            },
            reach: parseFloat((_.get(subdomain, 'reach.percentage') || '0.0').replace('%', '')),
            timeRange: parseInt(_.get(subdomain, 'timeRange.months') || '0'),
          }))
          : {
            url: subdomains.dataUrl,
            pageViews: {
              perUser: parseFloat((_.get(subdomains, 'pageViews.perUser') || '0.0')),
              percentage: parseFloat((_.get(subdomains, 'pageViews.percentage') || '0.0').replace('%', '')),
            },
            reach: parseFloat((_.get(subdomains, 'reach.percentage') || '0.0').replace('%', '')),
            timeRange: parseInt(_.get(subdomains, 'timeRange.months') || '0'),
          };

        return {
          ...source,
          verifiedByUserId: req.user.id,
          url: _.get(info, 'contentData.dataUrl', ''),
          title: _.get(info, 'contentData.siteData.title', ''),
          description: _.get(info, 'contentData.siteData.description', ''),
          rank: parseInt(_.get(info, 'trafficData.rank') || '0'),
          linksInCount: parseInt(_.get(info, 'contentData.linksInCount') || '0'),
          categories: {
            path: _.get(info, 'related.categories.categoryData.absolutePath', ''),
            title: _.get(info, 'related.categories.categoryData.title', ''),
          },
          relatedLinks: (_.get(info, 'related.relatedLinks.relatedLink') || []).map((related) => ({
            ...related,
            url: related.dataUrl,
          })),
          speed: {
            medianLoadTime: parseInt(_.get(info, 'contentData.speed.medianLoadTime') || '0'),
            percentile: parseInt(_.get(info, 'contentData.speed.percentile') || '0'),
          },
          rankByCountry: (_.get(info, 'trafficData.rankByCountry.country') || []).map((country) => ({
            code: country.code,
            contribution: {
              pageViews: parseFloat((_.get(country, 'contribution.pageViews') || '0.0').replace('%', '')),
              users: parseFloat((_.get(country, 'contribution.users') || '0.0').replace('%', '')),
            },
            rank: parseInt(_.get(country, 'rank') || '0'),
          })),
          subdomains: mappedSubdomains,
          timestamp: r.now().inTimezone(PH_TIMEZONE),
          socialScore,
          faviconUrl,
          aboutUsUrl,
          contactUsUrl,
          brand,
        };
      }));

      const { changes } = await r.table(tbl)
        .insert(sourcesInfo, { returnChanges: true })
        .run(conn);
      const insertedVals = changes.map((change) => change.new_val);

      await r.table('usersFeed').insert({
        user: req.user.id,
        type: 'create',
        sourceIds: sourcesInfo.map((info) => info.id),
        timestamp: insertedVals[0].timestamp,
        table: tbl,
      }).run(conn);

      return res.json(insertedVals);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;
    const { isIdChanged } = req.query;
    const source = req.body;

    if (isIdChanged) {
      source.id = await r.uuid(source.url).run(conn);
    }

    try {
      const { changes } = await r.table(tbl)
        .get(sourceId)
        .update(source, { returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        user: req.user.id,
        type: 'update',
        updated: getUpdatedFields(changes),
        sourceId: source.id,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = '' } = req.body;

    try {
      const { changes } = await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .delete({ returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        user: req.user.id,
        type: 'delete',
        deleted: changes.map((change) => change.old_val),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:sourceId', async (req, res, next) => {
    const { sourceId = '' } = req.params;

    try {
      const { changes } = await r.table(tbl)
        .get(sourceId)
        .delete({ returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        user: req.user.id,
        type: 'delete',
        deleted: changes.map((change) => change.old_val),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
