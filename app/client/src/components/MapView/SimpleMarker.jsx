import React, { PureComponent } from 'react';
import { Header, Grid, Icon, Label } from 'semantic-ui-react';
import { Motion, spring } from 'react-motion';
import { Tooltip } from 'react-tippy';
import moment from 'moment';
import './styles.css';
import TutuLogo from '../../assets/logo/tutu-logo.svg';
import ImagePlaceholder from '../Common/ImagePlaceholder';
import { DATE_FORMAT } from '../../constants';

const config = { stiffness: 140, damping: 14 };
const toCSS = (translateX) => ({ transform: `translateX: ${translateX}px` });

class SimpleMarker extends PureComponent {
  render() {
    const {
      article: {
        title,
        source,
        publishDate,
        topImageUrl,
      },
      isCredible,
      $hover,
      isFocused,
    } = this.props;

    return (
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
                      <ImagePlaceholder
                        src={topImageUrl}
                      />
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
        disabled={isFocused}
        animateFill={false}
        sticky
      >
        <Motion
          defaultStyle={{
            top: 220,
            x: 0,
          }}
          style={{
            top: spring(0, config),
            x: spring(10, config),
          }}
        >
          {(v) => (
            <Icon
              color={isCredible ? 'red' : 'black'}
              size={$hover ? 'huge' : 'big'}
              name="marker"
              className={`simple-marker-icon marker ${$hover ? 'hovered' : ''}`}
              style={toCSS(v.translateX)}
            />
          )}
        </Motion>
      </Tooltip>
    );
  }
}

export default SimpleMarker;
