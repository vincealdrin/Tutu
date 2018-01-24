import React, { PureComponent } from 'react';
import { List, Label, Grid, Header } from 'semantic-ui-react';
import shortid from 'shortid';
import moment from 'moment';
import { Tooltip } from 'react-tippy';
import { DATE_FORMAT } from '../../constants';
import './styles.css';
import ImagePlaceholder from '../Common/ImagePlaceholder';

class ClusterMarker extends PureComponent {
  render() {
    const {
      count,
      articles,
      $hover,
      isCredible,
      isFocused,
    } = this.props;

    return (
      <Tooltip
        position="bottom-start"
        trigger="manual"
        html={
          <Grid className="cluster-list-container">
            {articles.slice(0, 4).map((article) => (
              <Grid.Row key={shortid.generate()} className="cluster-article-container">
                <Grid.Column width={7}>
                  <div className="img-placeholder-wrapper">
                    <ImagePlaceholder src={article.topImageUrl} />
                  </div>
                </Grid.Column>
                <Grid.Column width={9} className="marker-title-column">
                  <Header as="a" color="blue" target="_blank" className="cluster-marker-title">
                    {article.title}
                  </Header>
                  <div className="cluster-article-date">
                    {moment(article.publishDate).format(DATE_FORMAT)}
                  </div>
                  <Label as="a" circular className="source-label">{article.source}</Label>
                </Grid.Column>
              </Grid.Row>
            ))}
            <Label className="see-more-button" attached="bottom">Click marker to view more stories...</Label>
          </Grid>
        }
        open={$hover}
        disabled={isFocused}
        animateFill={false}
        sticky
      >
        <div
          className={`cluster-marker-container ${isCredible ? '' : 'cluster-marker-container-not-credible'}`}
          style={$hover ? { zIndex: 10000 } : null}
        >
          <div className={`cluster-marker-container-radiant ${isCredible ? '' : 'cluster-marker-container-not-credible'} ${$hover ? 'cluster-marker-container-hovered' : ''}`} />
          <p>{count}</p>
        </div>
      </Tooltip>
    );
  }
}

export default ClusterMarker;
