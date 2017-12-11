import React, { PureComponent } from 'react';
import { Header, Grid, Image, Icon, Label } from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import './styles.css';


class SimpleMarker extends PureComponent {
  render() {
    const {
      topImageUrl,
      title,
      source,
      url,
      publishDate,
      $hover,
    } = this.props;

    return (
      <Tooltip
        position="right-start"
        distance={15}
        html={
          <div className="simple-marker">
            <Grid>
              <Grid.Row columns={2}>
                <Grid.Column width={7}>
                  <Image src={topImageUrl} />
                </Grid.Column>
                <Grid.Column width={9} className="marker-title-column">
                  <Header as="a" color="blue" href={url} target="_blank" className="simple-marker-title">{title}</Header>
                  <p className="article-date">{new Date(publishDate).toDateString()}</p>
                  <Label as="a" circular className="source-label">{source}</Label>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Label className="see-more-button simple-marker-see-more" attached="bottom">Click marker to view more details</Label>
          </div>
        }
        arrow
        sticky
        interactive
      >
        <Icon
          color="red"
          name="marker"
          size={$hover ? 'huge' : 'big'}
          className={`marker ${$hover ? 'hovered' : ''}`}
        />
      </Tooltip>
    );
  }
}

export default SimpleMarker;
