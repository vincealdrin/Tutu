import React, { Component } from 'react';

class AppSidebar extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default AppSidebar;
