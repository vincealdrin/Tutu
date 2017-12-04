import React, { Component } from 'react';
import { Input, Icon, Label, Segment, Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchArticles } from '../../modules/mapArticles';
import Slider from 'rc-slider';
import {
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
  changeLimitFilter,
  changeOrganizationsFilter,
  changePeopleFilter,
} from '../../modules/filters';
import { mapOptions } from '../../utils';
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
  changeOrganizationsFilter,
  changePeopleFilter,
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
      people,
      organizations,
      timeWindow,
      limit,
    } = filters;

    return (
      <div>
        <Segment>
          <Label as="a" color="teal" ribbon style={{ marginBottom: '1rem' }}>Filter</Label>
          <div className="scrollable-section">
            filter -
            <Dropdown
              placeholder="Keywords"
              options={keywords.map(mapOptions)}
              value={keywords}
              onChange={(_, { value }) => {
                this.props.changeKeywordsFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
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
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              fluid
              multiple
            />
            Sources -
            <Dropdown
              placeholder="Sources"
              options={sources.map(mapOptions)}
              value={sources}
              onChange={(_, { value }) => {
                this.props.changeSourcesFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              fluid
              multiple
              allowAdditions
            />
            filter -
            <Dropdown
              placeholder="Organizations"
              options={organizations.map(mapOptions)}
              value={organizations}
              onChange={(_, { value }) => {
                this.props.changeOrganizationsFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              fluid
              multiple
              allowAdditions
            />
            filter -
            <Dropdown
              placeholder="People"
              options={people.map(mapOptions)}
              value={people}
              onChange={(_, { value }) => {
                this.props.changePeopleFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              fluid
              multiple
              allowAdditions
            />
            timewindow
            <Slider.Range
              min={0}
              max={31}
              allowCross={false}
              value={timeWindow}
              onChange={(value) => {
                this.props.changTimeWindowFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
            />
            {`${31 - timeWindow[0]}days ago - ${31 - timeWindow[1]}days ago`}
          </div>
        </Segment>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

