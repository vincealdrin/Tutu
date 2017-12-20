import React, { Component } from 'react';
import { Feed, Icon } from 'semantic-ui-react';
import timeago from 'timeago.js';
import shortid from 'shortid';

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
                <i>Publish date: {new Date(log.article.publishDate).toDateString()}</i>
              </p>
            ),
            actionMessage: 'Crawling was successful',
            icon: 'thumbs up',
          };
        default:
          return {
            feedHtml: (
              <p>{`-- ${log.errorMessage}`}</p>
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
              <a href={log.sourceUrl} target="__blank">{log.sourceBrand}</a>
              {` has ${log.articlesCount} article${log.articlesCount > 1 ? 's' : ''}`}
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
                  <Feed.Date>{timeago().format(log.timestamp)}</Feed.Date>
                </Feed.Summary>
                <Feed.Extra>
                  {log.article && <a href={log.article.url} target="__blank">{log.article.title}</a>}
                  {feedHtml}
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

