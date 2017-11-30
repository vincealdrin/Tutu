import React, { Component } from 'react';
import { Input, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addRecentArticle, fetchRecentArticles } from '../../modules/recentArticles';
import './styles.css';

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({

}, dispatch);


class Filter extends Component {
  render() {
    return (
      <div className="filter-container">
        filter -
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

