import React, { Component } from 'react';
import moment from 'moment';
import { Accordion, Icon, List, Label } from 'semantic-ui-react';
import { DATE_FORMAT } from '../../constants';

class RelatedArticles extends Component {
  state = {
    activeIndex: 0,
  }

  showRelatedArticles = (_, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }

  render() {
    const { activeIndex } = this.state;
    const { content } = this.props;
    return (
      <Accordion style={{ margin: '1rem 0' }}>
        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.showRelatedArticles}>
          <Icon name="dropdown" />
          Recommended Stories
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <List divided relaxed>
            {content.length > 0
              ? content.map((relatedArticle) => (
                <List.Item>
                  <List.Header
                    as="a"
                    color="blue"
                    href={relatedArticle.url}
                    target="_blank"
                    className="related-articles"
                  >
                    {relatedArticle.title}
                  </List.Header>
                  <List.Description>
                    <p className="article-date">
                      {moment(relatedArticle.publishDate).format(DATE_FORMAT)}
                    </p>
                    <Label circular className="related-source-label">{relatedArticle.source}</Label>
                  </List.Description>
                </List.Item>
              ))
              : <span className="no-info">No related articles found</span>
            }
          </List>
        </Accordion.Content>
      </Accordion>
    );
  }
}

export default RelatedArticles;
