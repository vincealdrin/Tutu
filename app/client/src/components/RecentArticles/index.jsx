import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import io from 'socket.io-client';
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
        <List divided relaxed>
          {articles.map((article) => (
            <List.Item>
              <List.Content>
                <List.Header as="a" href={article.url} target="__blank">{article.title}</List.Header>
                <List.Description>
                  {article.summary[0]} -- {new Date(article.timestamp).toLocaleTimeString()}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecentArticles);

