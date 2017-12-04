import React, { Component } from 'react';
import { Label, Popup, Header, Icon, Image, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import { Tooltip } from 'react-tippy';
import './styles.css';

class SimpleMarker2 extends Component {
  state = { isOpen: false }

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

    fetchRelatedArticles(
      title,
      keywords.join(),
      people.join(),
      organizations.join(),
      categories.join(),
    );
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
      },
    } = this.props;
    const length = 400;
    const shortSummary = `${summary[0].substring(0, length)}...`;
    const multiAuthor = authors.map((author) => (
      <span>
        {author},
      </span>
    ));

    return (
      <Tooltip
      // options
        position="left"
        onShow={() => this.setState({ isOpen: true })}
        onHide={() => this.setState({ isOpen: false })}
        distance={15}
        html={
          <div>
            <div className="image-container">
              <Image
                src={topImageUrl}
                shape="rounded"
                className="simple-marker-image"
              />
              <Button color="blue" content="Read More" className="read-more-button" circular href={url} target="_blank" />
            </div>

            <Header as="a" href={url} target="_blank" color="blue">{title}</Header>

            <div style={{ color: '#a4a4a4', margin: '0.3rem 0 1.3rem' }} >
              <Label as="a" href={sourceUrl} color="yellow" ribbon >{source}</Label>
              <div style={{ float: 'right' }}>
                {multiAuthor}
                <br />
                {new Date(publishDate).toDateString()}
              </div>
            </div>

            <article style={{ margin: '0 0 1.3rem' }}>
              {shortSummary}
            </article>

            <section className="article-extra">
              <Label.Group size="tiny" style={{ display: 'flex', marginBottom: '0.4rem' }}>
                <div style={{ marginRight: '0.4rem' }}>
                  <Label basic color="pink">Category</Label>
                </div>
                <div>
                  {categories.map((category) => <Label key={shortid.generate()} tag>{category}</Label>)}
                </div>
              </Label.Group>
              <Label.Group size="tiny" style={{ display: 'flex', marginBottom: '0.4rem' }}>
                <div style={{ marginRight: '0.4rem' }}>
                  <Label basic color="teal">Keywords</Label>
                </div>
                <div>
                  {keywords.slice(0, 5).map((keyword) => (<Label as="a" key={shortid.generate()} tag style={{ marginBottom: '0.3rem' }}>{keyword}</Label>))}
                </div>
              </Label.Group>
              <Label.Group size="tiny" style={{ display: 'flex' }}>
                <div style={{ marginRight: '0.4rem' }}>
                  <Label basic color="orange">Sentiment</Label>
                </div>
              </Label.Group>
            </section>
          </div>
        }
        sticky
        arrow
        interactive
      >
        <Icon
          color="red"
          name="marker"
          size={this.state.isOpen ? 'huge' : 'big'}
          className={`marker ${this.state.isOpen ? 'hovered' : ''}`}
        />
      </Tooltip>
    );
  }
}

export default SimpleMarker2;
