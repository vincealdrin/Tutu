import React, { Component } from 'react';
import { Accordion, Icon, List } from 'semantic-ui-react';

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
            Related Stories
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <List divided relaxed>
            {content.length > 0
            ?
              content.map((relatedArticle) => (
                <List.Item>
                  <List.Header as="a" color="blue" href={relatedArticle.url} target="_blank">{relatedArticle.title}</List.Header>
                </List.Item>
              ))
            :
              <span className="no-info">No related articles found</span>
            }
          </List>
        </Accordion.Content>
      </Accordion>
    );
  }
}

export default RelatedArticles;
