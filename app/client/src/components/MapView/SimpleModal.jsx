import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  List,
  Dimmer,
  Label,
  Modal,
  Grid,
  Header,
} from 'semantic-ui-react';
import moment from 'moment';
import Tags from './Tags';
import RelatedArticles from './RelatedArticles';
import Reactions from './Reactions';
import topImgPlaceholder from '../../assets/placeholder/top-img-placeholder.png';
import { removeFocused } from '../../modules/mapArticles';
import './styles.css';
import { DATE_FORMAT } from '../../constants';
import { getSentimentColor } from '../../utils';
import CredibleArticles from './CredibleArticles';

const mapStateToProps = ({
  mapArticles: {
    infoStatus,
    focusedInfo,
    focusedOn,
    isCredible,
  },
}) => ({
  isOpen: focusedOn === 'simple' && !infoStatus.cancelled,
  article: focusedInfo,
  status: infoStatus,
  isCredible,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  removeFocused,
}, dispatch);

class SimpleModal extends PureComponent {
  state = { topImgUrl: '' };

  handleImgError = () => {
    this.setState({ topImgUrl: topImgPlaceholder });
  }

  render() {
    const {
      isOpen,
      article: {
        sentiment,
        summary,
        title,
        publishDate,
        source,
        sourceUrl,
        url,
        id,
        topImageUrl,
        reactions = {
          happy: 0,
          sad: 0,
          afraid: 0,
          amused: 0,
          angry: 0,
          inspired: 0,
        },
        authors = [],
        categories = [],
        keywords = [],
        organizations = [],
        people = [],
        relatedArticles = [],
      },
      status,
      isCredible,
    } = this.props;
    const { topImgUrl } = this.state;

    return (
      <Modal
        className="modal-container"
        size="tiny"
        open={isOpen}
        onClose={this.props.removeFocused}
        closeOnDimmerClick
        dimmer
      >
        {status.success ? (
          <Label
            as="a"
            target="_blank"
            className="news-label"
            color="orange"
            href={sourceUrl}
            title={sourceUrl}
            ribbon
          >
            <div className="news-label-name">{source}</div>
          </Label>
        ) : null}
        <Modal.Content scrolling>
          {!isCredible ? <CredibleArticles id={id} /> : null}
          {status.pending ? (
            <Dimmer active inverted>
              <Header as="h4">Loading article...</Header>
            </Dimmer>
          ) : null}
          <Grid columns={2} style={{ marginBottom: '1rem' }} stackable>
            <Grid.Column width={7}>
              <div className="image-tag-title-container">
                <div
                  className="top-image"
                  style={{
                    width: 219.63,
                    maxHeight: 298,
                    backgroundImage: `url(${topImgUrl || topImageUrl || topImgPlaceholder})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                  onError={this.handleImgError}
                />
              </div>
            </Grid.Column>
            <Grid.Column width={9}>
              <List divided relaxed>
                <List.Item>
                  <Label
                    as="a"
                    className="tag-label"
                    color={getSentimentColor(sentiment)}
                  >
                      Sentiment
                  </Label>
                  <span className="article-tags">{sentiment}</span>
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Categories</Label>
                  <Tags content={categories} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Keywords</Label>
                  <Tags content={keywords} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Organizations</Label>
                  <Tags content={organizations} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">People</Label>
                  <Tags content={people} />
                </List.Item>
              </List>
            </Grid.Column>
          </Grid>
          <Header
            as="a"
            color="blue"
            href={url}
            target="_blank"
          >
            {title}
          </Header>
          <p className="article-date">
            {moment(publishDate).format(DATE_FORMAT)}
            &nbsp;{status.success && authors.length > 0 ? ` | ${authors.join(', ')}` : ''}
          </p>
          <div className="carousel-container">
            {summary}
          </div>
          <RelatedArticles content={relatedArticles} />
          <div className="extras">
            {!status.pending && status.success ? (
              <Reactions
                reactions={reactions}
                id={id}
              />
            ) : null}
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SimpleModal);

