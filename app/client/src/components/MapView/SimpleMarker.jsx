import React, { PureComponent } from 'react';
import { Header, Grid, Image, Icon, Label } from 'semantic-ui-react';
import { Motion, spring } from 'react-motion';
import { Tooltip } from 'react-tippy';
import moment from 'moment';
import topImgPlaceholder from '../../assets/placeholder/top-img-placeholder.png';
import './styles.css';
import TutuLogo from '../../assets/logo/tutu-logo.svg';
import { DATE_FORMAT } from '../../constants';

const config = { stiffness: 140, damping: 14 };
const toCSS = (translateX) => ({ transform: `translateX: ${translateX}px` });

class SimpleMarker extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      topImgUrl: this.props.article.topImageUrl || topImgPlaceholder,
    };
  }

  handleImgError = () => {
    this.setState({ topImgUrl: topImgPlaceholder });
  }

  render() {
    const {
      article: {
        title,
        source,
        publishDate,
      },
      isCredible,
      $hover,
    } = this.props;
    const { topImgUrl } = this.state;

    return (
      <Tooltip
        position="bottom-start"
        html={
          <div className="simple-marker">
            <Grid>
              <Grid.Row columns={2}>
                <Grid.Column width={7}>
                  {$hover ? (
                    <Image
                      src={topImgUrl}
                      onError={this.handleImgError}
                    />
                  ) : null}
                </Grid.Column>
                <Grid.Column width={9} className="marker-title-column">
                  <Header as="a" color="blue" target="_blank" className="simple-marker-title">{title}</Header>
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
            <div>
              <Icon
                color={isCredible ? 'red' : 'black'}
                name="simple-marker-icon"
                size={$hover ? 'huge' : 'big'}
                className={`marker ${$hover ? 'hovered' : ''}`}
                style={toCSS(v.translateX)}
              />
            </div>
            )
          }
        </Motion>
      </Tooltip>
    );
  }
}

export default SimpleMarker;
