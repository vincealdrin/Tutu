import React, { PureComponent } from 'react';
import { Card } from 'semantic-ui-react';
import Article from './Article';

class ArticlesGrid extends PureComponent {
  render() {
    const {
      articles,
      fetchArticle,
    } = this.props;

    return (
      <Card.Group itemsPerRow={4} stackable>
        {articles.map((article) => (
          <Article
            key={article.id}
            article={article}
            fetchArticle={() => fetchArticle(article)}
          />
        ))}
      </Card.Group>
    );
  }
}

export default ArticlesGrid;

