import React, { Component } from 'react';
import {
  Grid,
  Header,
  Divider,
  Label,
  Segment,
  Button,
  Dimmer,
  Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import shortid from 'shortid';
import moment from 'moment';
import { addRecentArticle, fetchRecentArticles } from '../../modules/recentArticles';
import { fetchFocusedInfo } from '../../modules/mapArticles';
import './styles.css';
import ImageErrorPlaceholder from '../Common/ImageErrorPlaceholder';

const mapStateToProps = ({
  recentArticles: {
    articles,
    fetchStatus,
  },
  mapArticles: {
    isCredible,
  },
  socket,
}) => ({
  articles,
  fetchStatus,
  isCredible,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addRecentArticle,
  fetchRecentArticles,
  fetchFocusedInfo,
}, dispatch);

class RecentArticles extends Component {
  componentDidMount() {
    const { socket, isCredible } = this.props;

    this.props.fetchRecentArticles(15, () => {
      socket.on('newArticle', (article) => {
        if (isCredible === article.isCredible) {
          this.props.addRecentArticle(article);
        }
      });
    });
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners();
  }

  render() {
    const { articles, fetchStatus } = this.props;

    return (
      <Segment className="rec-segment-container">
        {fetchStatus.pending ? (
          <Dimmer active inverted>
            <Loader inverted content="Loading recent articles..." />
          </Dimmer>
          ) : null}
        {!fetchStatus.pending ? (
          <Label color="blue" ribbon style={{ marginBottom: '1rem' }}>Recent Articles</Label>
          ) : null }
        <div className="rec-scrollable-section">
          {articles.map((article) => (
            <div key={shortid.generate()}>
              <Grid className="article-item-container">
                <Grid.Row className="article-item">
                  <Grid.Column width={6} className="article-info" style={{ padding: '1.3rem !important' }}>
                    <ImageErrorPlaceholder src={article.topImageUrl} />
                    <Button
                      onClick={() => this.props.fetchFocusedInfo(article)}
                      content="View details"
                      color="blue"
                      style={{ position: 'absolute', left: '1rem', bottom: 0 }}
                    />
                  </Grid.Column>

                  <Grid.Column width={10} className="article-info">
                    <Header color="blue" as="a" href={article.url} className="article-title" target="_blank">{article.title}</Header>
                    <br />
                    <a href={article.sourceUrl} target="_blank" className="source-name">{article.source}</a> <span className="source-name"> —  {moment(article.timestamp).fromNow()}</span>
                    <p>{article.summary}</p>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Divider section />
            </div>
            ))}
        </div>
      </Segment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecentArticles);

