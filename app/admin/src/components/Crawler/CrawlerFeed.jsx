import React, { Component } from 'react';
import { Feed, Icon } from 'semantic-ui-react';
import timeago from 'timeago.js';
import shortid from 'shortid';

class CrawlerFeed extends Component {
  getLogAction = (type, status) => {
    if (type === 'articleCrawl') {
      switch (status) {
        case 'pending':
          return {
            actionMessage: 'Crawling has started',
            icon: 'bug',
          };
        case 'success':
          return {
            actionMessage: 'Crawling was successful',
            icon: 'thumbs up',
          };
        case 'error':
          return {
            actionMessage: 'Crawling has stopped for some reason',
            icon: 'warning sign',
          };
        default:
          return {
            actionMessage: 'Something went wrong...',
            icon: 'warning sign',
          };
      }
    }

    switch (status) {
      case 'pending':
        return {
          actionMessage: 'Building the news source',
          icon: 'cogs',
        };
      case 'success':
        return {
          actionMessage: 'Succesfully crawled the news source',
          icon: 'thumbs up',
        };
      case 'error':
        return {
          actionMessage: 'Building the news source has failed',
          icon: 'warning sign',
        };
      default:
        return {
          actionMessage: 'Something went wrong...',
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
          } = this.getLogAction(log.type, log.status);

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
                  <a href={log.articleUrl} target="__blank">{log.articleUrl}</a>
                  {log.error ? <p>{`-- ${log.error}`}</p> : null}
                  {log.type === 'sourceCrawl' ? (
                    <span>
                      {log.status === 'pending' ? (
                        <p>
                          <a href={log.sourceUrl} target="__blank">{log.sourceTitle}</a>
                          {` has ${log.articlesCount} article${log.articlesCount > 1 ? 's' : ''}`}
                        </p>
                      ) : (
                        <p>
                          {`${log.articlesCrawledCount} article${log.articlesCrawledCount > 1 ? 's were' : ' was'} crawled on `}
                          <a href={log.sourceUrl} target="__blank">{log.sourceTitle}</a>
                        </p>
                      )}
                    </span>
                  ) : null}
                  {log.type === 'articleCrawl' && log.status === 'success' ? (
                    <p>
                      {log.article.summary}<br />
                      <i>Publish date: {new Date(log.article.publishDate).toDateString()}</i>
                    </p>
                  ) : null}
                </Feed.Extra>
                {log.type === 'articleCrawl' ? (
                  <Feed.Meta>
                    <Feed.Like>
                      {log.status === 'pending' ? (
                        <span>
                          <Icon name="time" />
                          {log.sleepTime} seconds
                        </span>
                      ) : (
                        <span>
                          <Icon name="time" />
                          {log.runtime.toFixed(2)} seconds
                        </span>
                      )}
                    </Feed.Like>
                    <Feed.Like href={`http://${log.sourceUrl}`} target="__blank">
                      <Icon name="world" />
                      {log.sourceTitle}
                    </Feed.Like>
                  </Feed.Meta>
                  ) : null}
              </Feed.Content>
            </Feed.Event>
          );
        })}

      </Feed>
    );
  }
}

export default CrawlerFeed;

