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

  render() {
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
      $hover,
      showFullInfo,
    } = this.props;
    const length = 400;
    const shortSummary = `${summary[0].substring(0, length)}...`;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    return (
      <Tooltip
        distance={15}
        html={
          <div>
            {showFullInfo ? (
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
                ) : (
                  'hi'
                )}
          </div>
        }
        open={$hover || showFullInfo}
        arrow
        sticky
        interactive
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
