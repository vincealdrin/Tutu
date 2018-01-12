import React, { Component } from 'react';
import {
	Grid,
	Image,
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
import { addRecentArticle, fetchRecentArticles } from '../../modules/recentArticles';
import { fetchFocusedInfo } from '../../modules/mapArticles';
import newsPlaceholder from '../../assets/placeholder/news-placeholder.png';
import './styles.css';

const mapStateToProps = ({
  recentArticles: {
		articles,
		fetchStatus
  },
  socket,
}) => ({
	articles,
	fetchStatus,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addRecentArticle,
  fetchRecentArticles,
  fetchFocusedInfo,
}, dispatch);

class RecentArticles extends Component {
  componentDidMount() {
    const { socket } = this.props;

    this.props.fetchRecentArticles(15, () => {
      socket.on('newArticle', (article) => {
        this.props.addRecentArticle(article);
      });
    });
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners();
  }

  render() {
    const { articles, fetchStatus } = this.props;

    return (
      <div>
        <Segment>
					{fetchStatus.pending ? (
						<Dimmer active inverted>
							<Loader inverted content="Loading articles..." />
						</Dimmer>
					) : null}
          <Label as="a" color="blue" ribbon style={{ marginBottom: '1rem' }}>Recent Articles</Label>
          <div className="scrollable-section">
						{articles.length
							? (
								articles.map((article) => (
									<div key={shortid.generate()}>
										<Grid>
											<Grid.Row className="article-item">
												<Grid.Column width={6} className="article-info" style={{ padding: '1.3rem !important' }}>
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
													<a href={`http://${article.sourceUrl}`} target="_blank" className="source-name">{article.source}</a> | <span>{new Date(article.publishDate).toLocaleDateString()}</span>
													<p> {article.summary[0]} </p>
												</Grid.Column>
											</Grid.Row>
										</Grid>
										<Divider section />
									</div>
								))
							)
							: (
								<div className="no-article-container">
									<div className="no-article-emoji-container">
										<Header className="no-article-emoji">┏༼ ◉ ╭╮ ◉༽┓</Header>
										<p className="no-article-desc">NO ARTICLES AVAILABLE</p>
									</div>
								</div>
							)}
          </div>
        </Segment>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecentArticles);

