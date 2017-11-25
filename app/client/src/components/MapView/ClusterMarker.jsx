import React, { Component } from 'react';
import './styles.css';

class ClusterMarker extends Component {
  render() {
    const { count } = this.props;

    return (
      <div className="cluster-marker-container">
        <p style={{ width: '1000px', color: 'red' }}>{count}</p>
      </div>
    );
  }
}

export default ClusterMarker;
