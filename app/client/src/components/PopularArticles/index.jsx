import React, { Component } from 'react';
import { Button, Grid, Image, Header, Divider, Label, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import shortid from 'shortid';
import { fetchPopularArticles } from '../../modules/popularArticles';
import { fetchFocusedInfo } from '../../modules/mapArticles';
import newsPlaceholder from '../../assets/placeholder/news-placeholder.png';
import './styles.css';

const mapStateToProps = ({
  popularArticles: {
    articles,
  },
}) => ({
  articles,
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
    const { articles } = this.props;

    return (
      <div className="popular-section-container">
        <Segment>
          <Label as="a" color="red" ribbon style={{ marginBottom: '1rem' }}>Popular Articles</Label>
          <div className="scrollable-section">
						{articles.length
							? (
								articles.map((article) => (
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
													<a href={`http://${article.sourceUrl}`} target="_blank" className="source-name">{article.source}</a>
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
)(PopularArticles);

