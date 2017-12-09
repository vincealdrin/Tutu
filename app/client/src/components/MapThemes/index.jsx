import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import shortid from 'shortid';
import { fetchMapStyle } from '../../modules/mapThemes';

const mapStateToProps = ({
  mapThemes: {
    mapStyle,
  },
}) => ({
  mapStyle,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchMapStyle,
}, dispatch);

class MapThemes extends Component {
  render() {
    return (
      <div>
        HELLO
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapThemes);
