import React, { Component } from 'react';
import { Label, List, Icon, Accordion } from 'semantic-ui-react';
import upperFirst from 'lodash/upperFirst';
import { fetchRelatedArticles } from '../../modules/mapArticles';
import './styles.css';

class MarkerAccordion extends Component {
  render() {
    const {
      summary,
      categories,
      keywords,
      sentiment,
      organizations,
      people,
    } = this.props;
    const length = 400;
    const shortSummary = `${summary[0].substring(0, length)}...`;

    const panels = [
      {
        title: {
          content: 'Summary',
          key: 'title1',
        },
        content: {
          content: (
            <p>{shortSummary}</p>
          ),
          key: 'content1',
        },
      },
      {
        title: {
          content: 'Tags',
          key: 'title2',
        },
        content: {
          content: (
            <div>
              <List divided selection>
                <List.Item>
                  <Label horizontal>Categories</Label>
                  {categories.join(', ')}
                </List.Item>
                <List.Item>
                  <Label horizontal>Organizations</Label>
                  {organizations.join(', ')}
                </List.Item>
                <List.Item>
                  <Label horizontal>People</Label>
                  {people.join(', ')}
                </List.Item>
                <List.Item>
                  <Label horizontal>Keywords</Label>
                  {keywords.join(', ')}
                </List.Item>
                <List.Item>
                  <Label horizontal>Sentiment</Label>
                  {upperFirst(sentiment)}
                </List.Item>
              </List>
            </div>
          ),
          key: 'content2',
        },
      },
      {
        title: {
          content: 'Related Stories',
          key: 'title3',
        },
        content: {
          content: (
            <div>relateed</div>
          ),
          key: 'content3',
        },
      },
    ];

    return (
      <Accordion defaultActiveIndex={0} panels={panels} />
    );
  }
}

export default MarkerAccordion;
