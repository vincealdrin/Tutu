import React, { PureComponent } from 'react';
import {
  List,
  Label,
  Popup,
} from 'semantic-ui-react';
import moment from 'moment';
import axios from 'axios';
import { DATE_FORMAT } from '../../constants';
import { crudStatus, updateCrudStatus } from '../../utils';

class CredibleArticles extends PureComponent {
  state = {
    articles: [],
    status: crudStatus,
  };

  fetchCredibleNews = async () => {
    const { id } = this.props;
    this.setState({
      status: updateCrudStatus({
        statusText: 'pending',
      }),
    });

    try {
      const { data: articles, status } = await axios.get('/articles/related', {
        params: {
          isCredible: 'yes',
          id,
        },
      });

      this.setState({
        status: updateCrudStatus({
          statusText: 'success',
          status,
        }),
        articles,
      });
    } catch (e) {
      this.setState({
        status: updateCrudStatus({
          statusText: 'error',
          errorMessage: e.response.data.message,
        }),
      });
    }
  }

  render() {
    const { articles, status } = this.state;

    return (
      <Popup
        trigger={
          <Label
            className="show-real-news-label"
            content="Related Credible News"
            attached="bottom left"
          />
        }
        position="right center"
        onOpen={this.fetchCredibleNews}
        hoverable
      >
        {status.pending ? 'Loading...' : null}
        {status.success && !articles.length ? 'Nothing found' : null}
        <List divided relaxed>
          {articles.map((article) => (
            <List.Item>
              <List.Content>
                <List.Header as="a" href={article.url} target="_blank">{article.title}</List.Header>
                <List.Description>
                  <a href={article.sourceUrl} target="_blank">{article.source}</a> |
                  &nbsp;{moment(article.publishDate).format(DATE_FORMAT)}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>

        {status.error ? 'ERROR' : null}
      </Popup>
    );
  }
}

export default CredibleArticles;
