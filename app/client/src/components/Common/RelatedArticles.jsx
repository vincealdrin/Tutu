import React, { PureComponent } from 'react';
import moment from 'moment';
import { Accordion, List, Label } from 'semantic-ui-react';
import { DATE_FORMAT } from '../../constants';

class RelatedArticles extends PureComponent {
  render() {
    const {
      isCredible,
      relatedArticles = [],
      credibleArticles = [],
    } = this.props;

    const panels = [
      {
        title: 'Recommended Articles',
        content: {
          content: (
            <div className="related-stories">
              <List divided relaxed>
                {relatedArticles.length
                  ? relatedArticles.map((article) => (
                    <List.Item>
                      <List.Header
                        as="a"
                        color="blue"
                        href={article.url}
                        target="_blank"
                        className="related-articles"
                      >
                        {article.title}
                      </List.Header>
                      <List.Description>
                        <p className="article-date">
                          {moment(article.publishDate).format(DATE_FORMAT)}
                        </p>
                        <Label circular className="related-source-label">{article.source}</Label>
                      </List.Description>
                    </List.Item>
                  ))
                  : <span className="no-info">No recommended articles</span>}
              </List>
            </div>
          ),
        },
      },
      {
        title: 'Recommended Credible Articles',
        content: {
          content: (
            <div className="related-stories">
              <List divided relaxed>
                {credibleArticles.length
                ? credibleArticles.map((article) => (
                  <List.Item>
                    <List.Header
                      as="a"
                      color="blue"
                      href={article.url}
                      target="_blank"
                      className="related-articles"
                    >
                      {article.title}
                    </List.Header>
                    <List.Description>
                      <p className="article-date">
                        {moment(article.publishDate).format(DATE_FORMAT)}
                      </p>
                      <Label circular className="related-source-label">{article.source}</Label>
                    </List.Description>
                  </List.Item>
                ))
                : <span className="no-info">No recommended credible articles</span>}
              </List>
            </div>
          ),
        },
      },
    ];

    return (
      <Accordion
        defaultActiveIndex={0}
        // panels={panels.slice(0, (isCredible ? 1 : 2))}
        panels={panels.slice((isCredible ? 0 : 1), (isCredible ? 1 : 2))}
        style={{ margin: '1rem 0' }}
      />
    );
  }
}

export default RelatedArticles;
