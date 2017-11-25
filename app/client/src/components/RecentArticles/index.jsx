import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import io from 'socket.io-client';
import { List } from 'semantic-ui-react';
import { addRecentArticle } from '../../modules/recentArticles';

const mapStateToProps = ({
  recentArticles: {
    articles,
  },
}) => ({
  articles,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addRecentArticle,
}, dispatch);

const socket = io.connect('http://localhost:5000/client');

class RecentArticles extends Component {
  componentDidMount() {
    socket.on('newArticle', (article) => {
      this.props.addRecentArticle(article);
      console.log(article);
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
                <List.Header as="a">{article.title}</List.Header>
                <List.Description as="a">{article.summary[0]}</List.Description>
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

