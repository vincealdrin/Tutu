const router = require('express').Router();
const r = require('rethinkdb');
const _ = require('lodash');
const rp = require('request-promise');
const {
  getAboutContactUrl,
  getFaviconUrl,
  getSourceInfo,
  getSourceBrand,
  getTitle,
  getSocialScore,
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
      const totalCount = await r.table(tbl).count().run(conn);
      let query = r.table(tbl);

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const cursor = await query
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
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
    const timestamp = new Date();

    try {
      const sourcesInfo = await Promise.all(sources.map(async (source) => {
        const url = /^https?:\/\//.test(source) ? source : `http://${source}`;
        const htmlDoc = await rp(url);
        const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, url);
        const faviconUrl = getFaviconUrl(htmlDoc);
        const infoPromise = await getSourceInfo(url, responseGroups);
        const socialScore = await getSocialScore(url);

        const info = await infoPromise;
        const title = getTitle(htmlDoc);
        const brand = _.trim(getSourceBrand(url, title));

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
          socialScore,
          id: await r.uuid(url).run(conn),
          faviconUrl,
          aboutUsUrl,
          contactUsUrl,
          timestamp,
          brand,
        };
      }));

      await r.table(tbl).insert(sourcesInfo).run(conn);
      return res.json(sourcesInfo);
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
      await r.table(tbl).get(sourceId).update(source).run(conn);

      res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = '' } = req.body;

    try {
      await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .delete()
        .run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:sourceId', async (req, res, next) => {
    const { sourceId = '' } = req.params;

    try {
      await r.table(tbl).getAll(sourceId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
