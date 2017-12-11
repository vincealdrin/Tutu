import React, { Component } from 'react';
import { Popup, List, Image, Label, Modal, Segment, Grid, Header, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import { Tooltip } from 'react-tippy';
import './styles.css';

class ClusterMarker extends Component {
  render() {
    const { count, articles, $hover } = this.props;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    return (
      <Tooltip
        position="right-start"
        html={
          <List divided relaxed className="cluster-list-container">
            {articles.slice(0, 5).map((article) => (
              <List.Item key={shortid.generate()} className="cluster-article-container">
                <Grid>
                  <Grid.Row columns={2}>
                    <Grid.Column width={7}>
                      <Image src={article.topImageUrl} />
                    </Grid.Column>
                    <Grid.Column width={9} className="marker-title-column">
                      <div>
                        <List.Header as="a" href={article.url} target="_blank">{article.title}</List.Header>
                        <List.Description className="article-date">{new Date(article.publishDate).toDateString()}</List.Description>
                        <Label as="a" circular className="source-label">{article.source}</Label>
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </List.Item>
            ))}
            <Label className="see-more-button" attached="bottom">Click marker to view more stories...</Label>
          </List>
        }
        open={$hover}
        // hmmm di maibaba ung position ng arrow eto na muna
        // arrow
        animateFill={false}
        sticky
      >
        <div className="cluster-marker-container" >
          <p>{count}</p>
        </div>
      </Tooltip>
    );
  }
}

export default ClusterMarker;
