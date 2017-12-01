import React, { Component } from 'react';
import { Input, Icon, Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchArticles } from '../../modules/mapArticles';
import {
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
  changeLimitFilter,
} from '../../modules/filters';
import './styles.css';

const mapStateToProps = ({
  filters,
  mapArticles: { mapState },
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

const categoriesOptions = [
  { key: 'Government & Politics', text: 'Government & Politics', value: 'Government & Politics' },
  { key: 'Nation', text: 'Nation', value: 'Nation' },
  { key: 'Weather', text: 'Weather', value: 'Weather' },
  { key: 'Business', text: 'Business', value: 'Business' },
  { key: 'Entertainment', text: 'Entertainment', value: 'Entertainment' },
  { key: 'Economy & Finance', text: 'Economy & Finance', value: 'Economy & Finance' },
  { key: 'Lifestyle', text: 'Lifestyle', value: 'Lifestyle' },
  { key: 'Science & Technology', text: 'Science & Technology', value: 'Science & Technology' },
  { key: 'Health', text: 'Health', value: 'Health' },
  { key: 'Sports', text: 'Sports', value: 'Sports' },
  { key: 'Accident', text: 'Accident', value: 'Accident' },
  { key: 'Crime', text: 'Crime', value: 'Crime' },
  { key: 'Calamity', text: 'Calamity', value: 'Calamity' },
];

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
          placeholder="Keywords"
          options={keywords.map((keyword) => ({
            key: keyword,
            text: keyword,
            value: keyword,
          }))}
          value={keywords}
          onChange={(_, { value }) => {
            this.props.changeKeywordsFilter(value);
            this.props.fetchArticles(center, zoom, bounds, filters);
          }}
          search
          selection
          fluid
          multiple
          allowAdditions
        />
        <Dropdown
          placeholder="Categories"
          options={categoriesOptions}
          onChange={(_, { value }) => {
            this.props.changeCategoriesFilter(value);
            this.props.fetchArticles(center, zoom, bounds, filters);
          }}
          search
          selection
          fluid
          multiple
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

