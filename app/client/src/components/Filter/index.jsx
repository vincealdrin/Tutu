import React, { Component } from 'react';
import { Input, Icon, Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
  changeLimitFilter,
  fetchArticles,
} from '../../modules/mapArticles';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    filters,
    mapState,
  },
}) => ({
  filters,
  mapState,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
  changeLimitFilter,
  fetchArticles,
}, dispatch);

class Filter extends Component {
  render() {
    const {
      filters,
      mapState: { center, zoom, bounds },
    } = this.props;
    const {
      keywords,
      categories,
      sources,
      timeWindow,
      limit,
    } = filters;

    return (
      <div className="filter-container">
        filter -
        <Dropdown
          placeholder="Add Keywords"
          options={keywords.map((keyword) => ({
            key: keyword,
            text: keyword,
            value: keyword,
          }))}
          value={keywords}
          onAddItem={() => {
            this.props.fetchArticles(center, zoom, bounds, filters);
          }}
          onChange={(_, { value }) => {
            this.props.changeKeywordsFilter(value);
          }}
          search
          selection
          fluid
          multiple
          allowAdditions
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

