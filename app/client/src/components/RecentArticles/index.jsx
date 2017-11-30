import React, { Component } from 'react';
import { Grid, Image, Icon, Button, Header, Divider, Label, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import io from 'socket.io-client';
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
  state = { visible: true };

  componentDidMount() {
    this.props.fetchRecentArticles();

    socket.on('newArticle', (article) => {
      this.props.addRecentArticle(article);
    });
  }

  toggleVisibility = () => {
    this.setState({ visible: !this.state.visible });
  };

  render() {
    const { visible } = this.state;
    const { articles } = this.props;

    return (
      <div>
        <div className="article-display-button" onClick={this.toggleVisibility}>
          <Icon name={`angle ${visible ? 'right' : 'left'}`} />
        </div>
        <div className={`recent-articles-container ${visible ? 'full' : 'hidden'}`}>
          <Segment>
            <Label as="a" color="blue" ribbon style={{ marginBottom: '1rem' }}>Newly Added Articles</Label>
            <div className="scrollable-section">
              {articles.map((article) => (
                <div>
                  <Grid>
                  <Grid.Row className="article-item">
                    <Grid.Column width={6} className="article-info">
                      <Image src={article.topImageUrl} href={article.url} target="_blank" />
                    </Grid.Column>

                    <Grid.Column width={10} className="article-info">
                      <Header as="h3">{article.title}</Header>
                      <p>
                        {article.summary[0]}
                      </p>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                  <Divider section />
                </div>
          ))}
            </div>
          </Segment>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecentArticles);

