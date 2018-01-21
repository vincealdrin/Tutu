import React, { PureComponent } from 'react';
import {
  Grid,
  Segment,
  Label,
  Image,
  Header,
  Card,
  Button,
} from 'semantic-ui-react';
import moment from 'moment';
import { DATE_FORMAT } from '../../constants';
import topImgPlaceholder from '../../assets/placeholder/top-img-placeholder.png';

class Article extends PureComponent {
  state = {
    topImgUrl: '',
  };

  handleImgError = () => {
    this.setState({ topImgUrl: topImgPlaceholder });
  }

  render() {
    const {
      article,
      fetchArticle,
    } = this.props;
    const { topImgUrl } = this.state;

    return (
      <Card>
        <Label
          as="a"
          target="_blank"
          className="news-label"
          color="orange"
          href={article.sourceUrl}
          title={article.sourceUrl}
          ribbon
        >
          <div className="news-label-name">{article.source}</div>
        </Label>
        <Image
          src={topImgUrl || article.topImageUrl || topImgPlaceholder}
          onError={this.handleImgError}
          href={article.url}
          target="_blank"
        />
        <Card.Content>
          <Card.Header
            as="a"
            href={article.url}
            target="_blank"
          >
            {article.title}
          </Card.Header>
          <Card.Meta>
            {moment(article.publishDate).format(DATE_FORMAT)} | {article.authors.join()}
          </Card.Meta>
          <Card.Description>{article.summary}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <div className="ui two buttons">
            <Button onClick={fetchArticle} primary>View Details</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

export default Article;

