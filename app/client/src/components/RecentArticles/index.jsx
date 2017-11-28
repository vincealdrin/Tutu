import React, { Component } from 'react';
import { Grid, Image, Header } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import io from 'socket.io-client';
import shortid from 'shortid';
import { List } from 'semantic-ui-react';
import { addRecentArticle, fetchRecentArticles } from '../../modules/recentArticles';
import './styles.css';

const mapStateToProps = ({
  recentArticles: {
    articles,
  },
}) => ({
  articles,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addRecentArticle,
  fetchRecentArticles,
}, dispatch);

const socket = io.connect('http://localhost:5000/client');

class RecentArticles extends Component {
  componentDidMount() {
    this.props.fetchRecentArticles();

    socket.on('newArticle', (article) => {
      this.props.addRecentArticle(article);
    });
  }

  render() {
    const { articles } = this.props;

    return (
      <div className="recent-articles-container">
        <Grid>
          {articles.map((article) => (
            <Grid.Row className="articles" style={{ padding: '2rem' }}>
              <Grid.Column width={7}>
                <Image src={article.topImage} href={article.url} target="_blank" />
              </Grid.Column>
              <Grid.Column width={9}>
                <Header as="h3">{article.title}</Header>
                <p>
                  {article.summary[0]}
                </p>
              </Grid.Column>
            </Grid.Row>
						))}
        </Grid>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecentArticles);

