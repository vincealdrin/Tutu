import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Feed, Icon } from 'semantic-ui-react';
import timeago from 'timeago.js';
import shortid from 'shortid';
import { fetchUsersFeed, addFeedItem } from '../../modules/usersFeed';

const mapStateToProps = ({
  usersFeed: {
    feed,
    fetchStatus,
  },
}) => ({
  feed,
  fetchStatus,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUsersFeed,
  addFeedItem,
}, dispatch);

class UsersFeed extends Component {
  componentDidMount() {
    this.props.fetchUsersFeed();
  }

  render() {
    const { feed } = this.props;
    return (
      <Feed className="crawlerfeed-container">
        {feed.map((item) => {
          const {
            icon,
            actionMessage,
            feedHtml,
          } = this.getLogAction(item);

          return (
            <Feed.Event key={shortid.generate()}>
              <Feed.Label icon={icon} />
              <Feed.Content>
                <Feed.Summary>
                  {actionMessage}
                  <Feed.Date>{timeago().format(item.timestamp)}</Feed.Date>
                </Feed.Summary>
                <Feed.Extra>
                  {item.article && <a href={item.article.url} target="__blank">{item.article.title}</a>}
                  {feedHtml}
                </Feed.Extra>
                <Feed.Meta>
                  <Feed.Like>
                    <span>
                      <Icon name={item.type === 'articleCrawl' && item.status === 'pending' ? 'hourglass start' : 'time'} />
                      {item.runTime.toFixed(2)} seconds
                    </span>
                  </Feed.Like>
                  {item.type === 'articleCrawl' ? (
                    <Feed.Like href={`http://${item.sourceUrl}`} target="__blank">
                      <Icon name="world" />
                      {item.sourceBrand}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UsersFeed);
