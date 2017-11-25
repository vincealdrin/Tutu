import React, { Component } from 'react';
import './styles.css';

class SimpleMarker extends Component {
  render() {
    const { article } = this.props;
    return (
      <div className="simple-marker-container">
        <p style={{ width: '1000px', color: 'yellow' }}>{article.title}</p>
      </div>
    );
  }
}

export default SimpleMarker;
