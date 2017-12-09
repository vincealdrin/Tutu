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
        position="left-start"
        distance={15}
        html={
          <List divided relaxed className="cluster-list-container">
            {articles.map((article) => (
              <List.Item key={shortid.generate()} className="cluster-article-container">
                <div className="favicon-container">
                  {/* <Image src={article.sourceFaviconUrl} className="news-source-favicon" /> */}
                </div>
                <div className="article-title-container">
                  <List.Header as="a" href={article.url} target="_blank">{article.title}</List.Header>
                  <List.Description className="article-date">{new Date(article.publishDate).toDateString()}</List.Description>
                </div>
              </List.Item>
            ))}
            <Label className="see-more-button" attached="bottom">See More</Label>
          </List>
        }
        open={$hover}
        arrow
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
