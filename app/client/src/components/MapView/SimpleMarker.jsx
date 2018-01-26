import React from 'react';
import { Header, Grid, Icon, Label } from 'semantic-ui-react';
import { Motion, spring } from 'react-motion';
import { Tooltip } from 'react-tippy';
import moment from 'moment';
import './styles.css';
import TutuLogo from '../../assets/logo/tutu-logo.svg';
import ImagePlaceholder from '../Common/ImagePlaceholder';
import { DATE_FORMAT } from '../../constants';

const config = { stiffness: 100, damping: 7, precision: 0.001 };
const defaultStyle = { scale: 0 };
const style = { scale: spring(1, config) };

const SimpleMarker = ({
  article: {
    title,
    source,
    publishDate,
    topImageUrl,
  },
  isCredible,
  $hover,
  isFocused,
  isMobile,
}) => (
  <Tooltip
    position="bottom-start"
    trigger="manual"
    html={
      <div className="simple-marker">
        <Grid>
          <Grid.Row>
            <Grid.Column width={7}>
              {$hover ? (
                <div className="img-placeholder-wrapper">
                  <ImagePlaceholder src={topImageUrl} />
                </div>
              ) : null}
            </Grid.Column>
            <Grid.Column width={9} className="marker-title-column">
              <Header as="a" color="blue" target="_blank" className="simple-marker-title">
                {title}
              </Header>
              <p className="article-date">{moment(publishDate).format(DATE_FORMAT)}</p>
              <Label as="a" circular className="source-label">{source}</Label>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Label className="see-more-button simple-marker-see-more" attached="bottom">
          Click marker to view more details
        </Label>
      </div>
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
        <Icon
          color={isCredible ? 'red' : 'black'}
          size={$hover ? 'huge' : 'big'}
          name="marker"
          className={`simple-marker-icon ${$hover ? 'hovered' : ''}`}
          style={{
            transform: `translate3D(0,0,0) scale(${scale}, ${scale})`,
          }}
        />
        )}
    </Motion>
  </Tooltip>
);

export default SimpleMarker;
