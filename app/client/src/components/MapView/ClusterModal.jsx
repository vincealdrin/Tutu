import React, { Component } from 'react';
import { Popup, List, Image, Label, Modal, Segment, Grid, Header, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class ClusterModal extends Component {
  render() {
    const {
      articles,
      open,
      removeFocused,
      updateReaction,
      status,
    } = this.props;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    if (status.pending && open) {
      console.log('pending');
      return 'pending';
    }

    return (
      <Modal
        className="modal-container"
        open={open}
        onClose={removeFocused}
        closeOnDimmerClick
        dimmer
      >
        <Modal.Content scrolling>
          {articles.map(({
            authors,
            categories,
            keywords,
            organizations,
            people,
            reactions = [],
            sentiment,
            summary,
            topImageUrl,
            relatedArticles,
            title,
            publishDate,
            source,
            sourceUrl,
            url,
          }) => {
            const [
              afraid = { reduction: 0 },
              amused = { reduction: 0 },
              angry = { reduction: 0 },
              happy = { reduction: 0 },
              inspired = { reduction: 0 },
              sad = { reduction: 0 },
            ] = reactions;

            return (
              <Segment key={shortid.generate()} raised className="modal-article-container">
                <Grid>
                  <Grid.Row columns={3}>
                    <Grid.Column width={4}>
                      <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{source}</Label>
                      <Image src={topImageUrl} />
                    </Grid.Column>
                    <Grid.Column width={8} style={{ marginTop: '3rem' }}>
                      <Header as="h3" href={sourceUrl} color="blue">{title}</Header>
                      <div className="author-date-container">
                        {authors.map((author) => (
                          <span key={shortid.generate()}>
                            {author},
                          </span>
                      ))}
                        <br />
                        {new Date(publishDate).toDateString()}
                      </div>
                      <div>
                        {`${summary[0].substring(0, 500)}...`}
                      </div>
                    </Grid.Column>
                    <Grid.Column width={4}>
                      <Label.Group size="tiny" className="label-group">
                        <div className="label-master">
                          <Label basic color="pink">Category</Label>
                        </div>
                        <div>
                          {categories.map((category) => (<Label tag key={shortid.generate()}>{category}</Label>))}
                        </div>
                      </Label.Group>
                      <Label.Group size="tiny" className="label-group">
                        <div className="label-master">
                          <Label basic color="teal">Keywords</Label>
                        </div>
                        <div>
                          {keywords.map((keyword) => (<Label as="a" tag style={{ marginBottom: '0.3rem' }} key={shortid.generate()}>{keyword}</Label>))}
                        </div>
                      </Label.Group>
                      <Label.Group size="tiny" className="label-group cluster-modal-sentiment">
                        <div className="label-master">
                          <Label basic color="orange">Sentiment</Label>
                        </div>
                        <div>
                          <Label as="a" tag style={{ textTransform: 'capitalize' }}> {sentiment}</Label>
                        </div>
                      </Label.Group>
                      <Button color="blue" circular style={{ float: 'right' }} href={url} target="_blank">Read More</Button>
                      reactions:
                      happy - {happy.reduction}
                      sad - {sad.reduction}
                      angry - {angry.reduction}
                      amused - {amused.reduction}
                      afraid - {afraid.reduction}
                      inspired - {inspired.reduction}
                      <Button
                        onClick={() => updateReaction(url, 'happy')}
                        content="happy"
                      />
                      <Button
                        onClick={() => updateReaction(url, 'sad')}
                        content="sad"
                      />
                      <Button
                        onClick={() => updateReaction(url, 'angry')}
                        content="angry"
                      />
                      <Button
                        onClick={() => updateReaction(url, 'amused')}
                        content="amused"
                      />
                      <Button
                        onClick={() => updateReaction(url, 'afraid')}
                        content="afraid"
                      />
                      <Button
                        onClick={() => updateReaction(url, 'inspired')}
                        content="inspired"
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            );
          })}
        </Modal.Content>
      </Modal>
    );
  }
}

export default ClusterModal;
