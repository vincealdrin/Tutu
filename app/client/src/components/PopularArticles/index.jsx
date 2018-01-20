import React, { Component } from 'react';
import {
  Button,
  Grid,
  Image,
  Header,
  Divider,
  Label,
  Segment,
  Dimmer,
  Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import shortid from 'shortid';
import moment from 'moment';
import { fetchPopularArticles } from '../../modules/popularArticles';
import { fetchFocusedInfo } from '../../modules/mapArticles';
import newsPlaceholder from '../../assets/placeholder/news-placeholder.png';
import './styles.css';
import { DATE_FORMAT } from '../../constants';

const mapStateToProps = ({
  popularArticles: {
    articles,
    fetchStatus,
  },
}) => ({
  articles,
  fetchStatus,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPopularArticles,
  fetchFocusedInfo,
}, dispatch);

class PopularArticles extends Component {
  componentDidMount() {
    this.props.fetchPopularArticles();
  }

  render() {
    const { articles, fetchStatus } = this.props;

    return (
      <div>
        <Segment className="pop-segment-container">
          {fetchStatus.pending ? (
            <Dimmer active inverted>
              <Loader inverted content="Loading popular articles..." />
            </Dimmer>
          ) : null}
          {!fetchStatus.pending ? (
            <Label as="a" color="red" ribbon style={{ marginBottom: '1rem' }}>Popular Articles</Label>
          ) : null}
          <div className="pop-scrollable-section">
            {articles.map((article) => (
              <div key={shortid.generate()}>
                <Grid>
                  <Grid.Row className="article-item">
                    <Grid.Column width={6} className="article-info" style={{ padding: '1.3rem !important', position: 'relative' }}>
                      <Image src={article.topImageUrl ? article.topImageUrl : newsPlaceholder} href={article.url} target="_blank" />
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
                      <a href={article.sourceUrl} target="_blank" className="source-name">{article.source}</a><span className="source-name"> —  {moment(article.publishDate).format(DATE_FORMAT)}</span>
                      <p>{article.summary}</p>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Divider section />
              </div>
            ))}
          </div>
        </Segment>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PopularArticles);

