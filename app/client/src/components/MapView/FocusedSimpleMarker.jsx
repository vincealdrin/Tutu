import React, { PureComponent } from 'react';
import { Label, List, Popup, Header, Icon, Image, Button, Accordion } from 'semantic-ui-react';
import shortid from 'shortid';
import upperFirst from 'lodash/upperFirst';
import { Tooltip } from 'react-tippy';
import Reactions from './Reactions';
import MarkerAccordion from './MarkerAccordion';
import './styles.css';


class FocusedSimpleMarker extends PureComponent {
  renderArticle() {
    const {
      article: {
        topImageUrl,
        url,
        source,
        title,
        authors,
        publishDate,
        summary,
        categories,
        keywords,
        sentiment,
        organizations,
        people,
        sourceUrl,
      },
      status,
    } = this.props;
    const length = 400;

    if (status.success) {
      const shortSummary = `${summary[0].substring(0, length)}...`;
      const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
      return (
        <div>
          <Label as="a" href={`http://${sourceUrl}`} ribbon color={colors[Math.floor(Math.random() * colors.length)]} target="_blank" className="news-label news-marker-tooltip">{source}</Label>
          <div className="image-container">
            <Image
              src={topImageUrl}
              shape="rounded"
              className="simple-marker-image"
            />
            <Button color="blue" content="Read More" className="read-more-button" circular href={url} target="_blank" />
          </div>

          <Header as="a" href={url} target="_blank" color="blue">{title}</Header>

          <div className="author-date-container">
            <div className="author-name">
              {authors.join(', ')} | {new Date(publishDate).toDateString()}
            </div>
          </div>

          <MarkerAccordion
            summary={shortSummary}
            categories={categories}
            keywords={keywords}
            sentiment={sentiment}
            organizations={organizations}
            people={people}
          />

          <Reactions />
        </div>
      );
    } else if (status.error) {
      return 'error';
    }

    return 'loading';
  }

  render() {
    return (
      <Tooltip
        position="top-end"
        distance={15}
        html={this.renderArticle()}
        open
        interactive
        arrow
        sticky
      >
        <Icon
          color="red"
          name="marker"
          size="huge"
          className="marker hovered"
        />
      </Tooltip>
    );
  }
}

export default FocusedSimpleMarker;
