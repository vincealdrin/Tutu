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

  getTypeAction = (type) => {
    switch (type) {
      case 'create':
        return 'created';
      case 'update':
        return 'updated';
      case 'delete':
        return 'deleted';
      case 'verify':
        return 'verified';
      default:
        return 'error';
    }
  }

  getTypeIcon = (type, isReliable) => {
    switch (type) {
      case 'create':
        return 'wrench';
      case 'update':
        return 'pencil';
      case 'delete':
        return 'trash';
      case 'verify':
        return isReliable ? 'thumbs up' : 'thumbs down';
      default:
        return 'error';
    }
  }

  render() {
    const { feed } = this.props;
    return (
      <Feed className="crawlerfeed-container">
        {feed.map((item) => {
          const {
            sources = [],
            deleted = [],
            source = {},
            table,
            timestamp,
            type,
            user,
            isReliable,
          } = item;

          return (
            <Feed.Event key={shortid.generate()}>
              <Feed.Label icon={this.getTypeIcon(type, isReliable)} />
              <Feed.Content>
                <Feed.Summary>
                  <Feed.User>{user}</Feed.User> has {this.getTypeAction(type)}
                  {type === 'verify' && isReliable ? ' a RELIABLE' : null}
                  {type === 'verify' && !isReliable ? ' a NOT RELIABLE' : null}
                  &nbsp;source/s in {table}&#39; table
                  <Feed.Date content={timeago().format(timestamp)} />
                </Feed.Summary>
                <Feed.Extra>
                  {sources.map((src, i) => (
                    <span>
                      <a href={src.url} target="_blank" >
                        {src.brand}
                      </a>{i === sources.length - 1 ? null : ', '}
                    </span>
                  ))}
                  {deleted.map((deletedSource, i) => (
                    <span>
                      <a href={deletedSource.url} target="_blank" >
                        {deletedSource.brand}
                      </a>{i === deleted.length - 1 ? null : ', '}
                    </span>
                  ))}
                  {type === 'verify' ? (
                    <p>
                      <a href={source.url} target="_blank" >
                        {source.brand}
                      </a> is verified to be a {isReliable ? 'reliable' : 'not reliable'} source
                    </p>
                  ) : null}
                </Feed.Extra>
                <Feed.Meta>
                  <Feed.Like>
                    <Icon name="time" />
                    {new Date(timestamp).toLocaleString()}
                  </Feed.Like>
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
