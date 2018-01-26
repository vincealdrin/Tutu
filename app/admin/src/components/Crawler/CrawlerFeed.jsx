import React, { Component } from 'react';
import { Feed, Icon } from 'semantic-ui-react';
import moment from 'moment';
import shortid from 'shortid';
import { DATE_FORMAT } from '../../constants';

class CrawlerFeed extends Component {
  getLogAction = (log) => {
    if (log.type === 'articleCrawl') {
      switch (log.status) {
        case 'pending':
          return {
            feedHtml: (
              <a href={log.articleUrl} target="__blank">{log.articleUrl}</a>
            ),
            actionMessage: 'Crawling has started',
            icon: 'bug',
          };
        case 'success':
          return {
            feedHtml: (
              <p>
                {log.article.summary}<br />
                <i>Publish date: {moment(log.article.publishDate).format(DATE_FORMAT)}</i>
              </p>
            ),
            actionMessage: 'Crawling was successful',
            icon: 'thumbs up',
          };
        default:
          return {
            feedHtml: (
              <span>
                <a href={log.articleUrl} target="__blank">{log.articleUrl}</a>
                <p>{`-- ${log.errorMessage}`}</p>
              </span>
            ),
            actionMessage: 'Crawling has stopped for some reason',
            icon: 'warning sign',
          };
      }
    }

    switch (log.status) {
      case 'pending':
        return {
          feedHtml: (
            <p>
              Crawler found new {`${log.articlesCount} article${log.articlesCount === 1 ? '' : 's'}`} in <a href={`http://${log.sourceUrl}`} target="__blank">{log.sourceBrand}</a>
              <br />
              <span>Proxy: {log.proxy}</span>
              <br />
              <span>User-Agent: {log.userAgent}</span>
            </p>
          ),
          actionMessage: 'Building the news source',
          icon: 'cogs',
        };
      case 'success':
        return {
          feedHtml: (
            <p>
              {`${log.articlesCrawledCount} article${log.articlesCrawledCount === 1 ? ' was' : 's were'} crawled on `}
              <a href={log.sourceUrl} target="__blank">{log.sourceBrand}</a>
            </p>
          ),
          actionMessage: 'Succesfully crawled the news source',
          icon: 'thumbs up',
        };
      default:
        return {
          feedHtml: (
            <span>
              <a href={log.sourceUrl} target="__blank">{log.sourceBrand}</a>
              <p>{`-- ${log.errorMessage}`}</p>
            </span>
          ),
          actionMessage: 'Building the news source has failed',
          icon: 'warning sign',
        };
    }
  }

  render() {
    const { logs } = this.props;

    return (
      <Feed className="crawlerfeed-container">
        {logs.map((log) => {
          const {
            icon,
            actionMessage,
            feedHtml,
          } = this.getLogAction(log);

          return (
            <Feed.Event key={shortid.generate()}>
              <Feed.Label icon={icon} />
              <Feed.Content>
                <Feed.Summary>
                  {actionMessage}
                  <Feed.Date>{moment(log.timestamp).fromNow()}</Feed.Date>
                </Feed.Summary>
                <Feed.Extra>
                  {log.article && <a href={log.article.url} target="__blank">{log.article.title}</a>}
                  {feedHtml}
                  &gt; {log.crawlerName}
                </Feed.Extra>
                <Feed.Meta>
                  <Feed.Like>
                    <span>
                      <Icon name={log.type === 'articleCrawl' && log.status === 'pending' ? 'hourglass start' : 'time'} />
                      {log.runTime.toFixed(2)} seconds
                    </span>
                  </Feed.Like>
                  {log.type === 'articleCrawl' ? (
                    <Feed.Like href={`http://${log.sourceUrl}`} target="__blank">
                      <Icon name="world" />
                      {log.sourceBrand}
                    </Feed.Like>
                  ) : null}
                </Feed.Meta>
              </Feed.Content>
            </Feed.Event>
          );
        })}

      </Feed>
    );
  }
}

export default CrawlerFeed;

