import React, { Component } from 'react';
import './styles.css';

class ClusterMarker extends Component {
  render() {
    const { count, articles } = this.props;
    return (
      <div className="cluster-marker-container">
        <p style={{ color: 'red' }}>{count}</p>
      </div>
    );
  }
}

export default ClusterMarker;
