import React, { PureComponent } from 'react';
import { Label, List, Popup, Header, Icon, Image, Button, Accordion } from 'semantic-ui-react';
import shortid from 'shortid';
import upperFirst from 'lodash/upperFirst';
import { Tooltip } from 'react-tippy';
import Reactions from './Reactions';
import MarkerAccordion from './MarkerAccordion';
import { fetchRelatedArticles } from '../../modules/mapArticles';
import './styles.css';


class SimpleMarker extends PureComponent {
  fetchRelated = () => {
    const {
      article: {
        title,
        keywords,
        people,
        organizations,
        categories,
      },
      fetchRelatedArticles,
    } = this.props;

    fetchRelatedArticles(title, keywords.join(), people.join(), organizations.join(), categories.join());
  }

  renderArticle() {
    const {
      article: {
        topImageUrl,
        url,
        sourceUrl,
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
      },
      status,
      article,
    } = this.props;
    const length = 400;
    console.log(article);
    if (status.success) {
      const shortSummary = `${summary[0].substring(0, length)}...`;
      const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
      return (
        <div>
          <Label as="a" href={`http://${source.url}`} ribbon color={colors[Math.floor(Math.random() * colors.length)]} target="_blank" className="news-label news-marker-tooltip">{source.title}</Label>
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
    const {
      article: {
        title,
      },
      $hover,
      showFullInfo,
    } = this.props;

    return (
      <Tooltip
        position={showFullInfo ? 'top-end' : 'left-start'}
        distance={15}
        html={
          <div>
            {showFullInfo ? this.renderArticle() : (
              <p>{title}</p>
            )}
          </div>
        }
        open={$hover || showFullInfo}
        interactive={!$hover && showFullInfo}
        useContext
        multiple
        arrow
        sticky
      >
        <Icon
          color="red"
          name="marker"
          size={$hover || showFullInfo ? 'huge' : 'big'}
          className={`marker ${$hover || showFullInfo ? 'hovered' : ''}`}
        />
      </Tooltip>
    // <Popup
    //   position="bottom left"
    //   className="popup-container"
    //   trigger={
    //     <Tooltip
    //       position="left-start"
    //       distance={15}
    //       html={
    //         <div onMouseEnter={this.openPopup} onMouseLeave={this.closePopup}>
    //           {showFullInfo ? (
    //             'awe'
    //           ) : (
    //             'hi'
    //           )}
    //         </div>
    //     }
    //       open={$hover || showFullInfo}
    //       arrow
    //       sticky
    //     >
    //       <Icon
    //         color="red"
    //         name="marker"
    //         size={$hover || showFullInfo ? 'huge' : 'big'}
    //         className={`marker ${$hover || showFullInfo ? 'hovered' : ''}`}
    //       />
    //     </Tooltip>
    //   }
    //   onOpen={() => {
    //   // this.fetchRelated();
    // }}
    //   open={showFullInfo}
    // >
    //   <Label as="a" href={`http://${sourceUrl}`} ribbon color={colors[Math.floor(Math.random() * colors.length)]} target="_blank" className="news-label news-marker-tooltip">{source}</Label>
    //   <div className="image-container">
    //     <Image
    //       src={topImageUrl}
    //       shape="rounded"
    //       className="simple-marker-image"
    //     />
    //     <Button color="blue" content="Read More" className="read-more-button" circular href={url} target="_blank" />
    //   </div>

    //   <Header as="a" href={url} target="_blank" color="blue">{title}</Header>

    //   <div className="author-date-container">
    //     <div className="author-name">
    //       {authors.join(', ')} | {new Date(publishDate).toDateString()}
    //     </div>
    //   </div>

    //   <MarkerAccordion
    //     summary={shortSummary}
    //     categories={categories}
    //     keywords={keywords}
    //     sentiment={sentiment}
    //     organizations={organizations}
    //     people={people}
    //   />

    //   <Reactions />

    // </Popup>
    );
  }
}

export default SimpleMarker;
