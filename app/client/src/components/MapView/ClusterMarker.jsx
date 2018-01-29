import React from 'react';
import { Label, Grid, Header } from 'semantic-ui-react';
import shortid from 'shortid';
import moment from 'moment';
import { Motion, spring } from 'react-motion';
import { Tooltip } from 'react-tippy';
import { DATE_FORMAT } from '../../constants';
import ImagePlaceholder from '../Common/ImagePlaceholder';
import './styles.css';

const config = { stiffness: 250, damping: 7, precision: 0.001 };
const defaultStyle = { scale: 0.2 };
const style = { scale: spring(1, config) };

const ClusterMarker = ({
  articles,
  $hover,
  isCredible,
  isFocused,
  isMobile,
}) => (
  <Tooltip
    position="bottom-start"
    trigger="manual"
    html={
      <Grid className="cluster-list-container">
        {articles.slice(0, 3).map((article) => (
          <Grid.Row key={shortid.generate()} className="cluster-article-container">
            <Grid.Column width={7}>
              <div className="img-placeholder-wrapper">
                {$hover ? (
                  <ImagePlaceholder src={article.topImageUrl} />
                ) : null}
              </div>
            </Grid.Column>
            <Grid.Column width={9} className="marker-title-column">
              <Header as="a" color="blue" target="_blank" className="cluster-marker-title">
                {article.title}
              </Header>
              <p className="cluster-article-date">
                {moment(article.publishDate).format(DATE_FORMAT)}
              </p>
              <Label as="a" circular className="source-label">{article.source}</Label>
            </Grid.Column>
          </Grid.Row>
        ))}
        <Label className="see-more-button" attached="bottom">Click marker to view full articles...</Label>
      </Grid>
    }
    open={$hover}
    disabled={isMobile || isFocused}
    animateFill={false}
    sticky
  >
    <Motion
      defaultStyle={defaultStyle}
      style={style}
    >
      {({ scale }) => (
        <div
          className={`cluster-marker-container ${isCredible ? '' : 'cluster-marker-container-not-credible'}`}
          style={{
            transform: `translate3D(0,0,0) scale(${scale}, ${scale})`,
            zIndex: $hover ? 10000 : 0,
          }}
        >
          {$hover ? (
            <div className={`cluster-marker-container-radiant ${isCredible ? '' : 'cluster-marker-container-not-credible'} cluster-marker-container-hovered`} />
          ) : null}
          <p>{articles.length}</p>
        </div>
      )}
    </Motion>
  </Tooltip>
);

export default ClusterMarker;
