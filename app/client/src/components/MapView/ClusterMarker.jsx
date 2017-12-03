import React, { Component } from 'react';
import { Popup, List } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class ClusterMarker extends Component {
  render() {
    const { count, clusters } = this.props;

    return (
      <Popup
        position="top left"
        trigger={<div className="cluster-marker-container"><p>{count}</p></div>}
        hoverable
        className="popup-container"
      >
        <List divided relaxed>
          {clusters.map((cluster) => cluster.points.map((point) => (<List.Item>{point.id}</List.Item>)))}
        </List>
      </Popup>
    );
  }
}

export default ClusterMarker;
