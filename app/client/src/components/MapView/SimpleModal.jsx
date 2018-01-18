import React, { Component } from 'react';
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
import { removeFocused } from '../../modules/mapArticles';
import './styles.css';
import { DATE_FORMAT } from '../../constants';

const mapStateToProps = ({
  mapArticles: {
    infoStatus,
    focusedInfo,
    focusedOn,
  },
}) => ({
  isOpen: focusedOn === 'simple' && !infoStatus.cancelled,
  article: focusedInfo,
  status: infoStatus,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  removeFocused,
}, dispatch);

class SimpleModal extends Component {
  getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') {
      return 'green';
    } else if (sentiment === 'Neutral') {
      return 'grey';
    } else if (sentiment === 'Negative') {
      return 'red';
    }

    return '';
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
    } = this.props;

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
          {status.pending ? (
            <Dimmer active inverted>
              <Header as="h4">Loading article...</Header>
            </Dimmer>
          ) : null}
          <Grid columns={2} style={{ marginBottom: '1rem' }}>
            <Grid.Column width={7}>
              <div className="image-tag-title-container">
                <div
                  className="top-image"
                  style={{
                    width: 219.63,
                    height: 294.84,
                    backgroundImage: `url(${topImageUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />
              </div>
            </Grid.Column>
            <Grid.Column width={9}>
              <List divided relaxed>
                <List.Item>
                  <Label
                    as="a"
                    className="tag-label"
                    color={this.getSentimentColor(sentiment)}
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
          <Header as="a" color="blue" href={url} target="_blank">{title}</Header>
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

