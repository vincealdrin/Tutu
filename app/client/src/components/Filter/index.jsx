import React, { Component } from 'react';
import { Label, Segment, Dropdown, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchArticles } from '../../modules/mapArticles';
import Slider from 'rc-slider';
import {
  changeCategoriesFilter,
  changeKeywordsFilter,
  changeLimitFilter,
  changeOrganizationsFilter,
  changePeopleFilter,
  changePopularSocialsFilter,
  changePopularTopFilter,
  changeSentimentFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
} from '../../modules/filters';
import { mapOptions } from '../../utils';
import './styles.css';

const mapStateToProps = ({
  filters,
  mapArticles: { filterMapState },
}) => ({
  filters,
  filterMapState,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changTimeWindowFilter,
  changeLimitFilter,
  changeOrganizationsFilter,
  changePeopleFilter,
  changePopularSocialsFilter,
  changePopularTopFilter,
  changeSentimentFilter,
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

const sentimentsOptions = [
  { key: 'none', text: 'None', value: 'none' },
  { key: 'positive', text: 'Positive', value: 'positive' },
  { key: 'neutral', text: 'Neutral', value: 'neutral' },
  { key: 'negative', text: 'Negative', value: 'negative' },
];

const popularSocialOptions = [
  { key: 'all', text: 'All', value: 'all' },
  { key: 'facebook', text: 'Facebook', value: 'facebook' },
  { key: 'reddit', text: 'Reddit', value: 'reddit' },
  { key: 'linkedin', text: 'LinkedIn', value: 'linkedin' },
  { key: 'pinterest', text: 'Pinterest', value: 'pinterest' },
  { key: 'stumbleupon', text: 'StumbleUpon', value: 'stumbleupon' },
];

const popularTopOptions = [
  { key: '100', text: '100', value: '100' },
  { key: '300', text: '300', value: '300' },
  { key: '500', text: '500', value: '500' },
  { key: '1000', text: '1000', value: '1000' },
];

class Filter extends Component {
  state = {
    popularSocialOptions,
  }

  render() {
    const {
      filters,
      filterMapState: { center, zoom, bounds },
    } = this.props;
    const {
      keywords,
      sources,
      people,
      organizations,
      timeWindow,
      limit,
    } = filters;
    const startRange = 31 - timeWindow[0];
    const endRange = 31 - timeWindow[1];

    return (
      <Segment>
        <Label as="a" color="teal" ribbon style={{ marginBottom: '1rem' }}>Filter</Label>
        <div className="scrollable-section filter-scrollable">
          <span className="input-label">SEARCH KEYWORDS</span>
          <Dropdown
            placeholder="Keywords"
            icon="search"
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
          <Divider />
          <span className="input-label">CATEGORIES</span>
          <Dropdown
            text="Select Category"
              // icon="globe"
              // className="icon half-width"
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
          <Divider />
          <span className="input-label">SOURCE</span>
          <Dropdown
            text="Source"
              // icon="browser"
              // className="icon half-width"
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
          <Divider />
          <span className="input-label">TIME WINDOW</span>
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
          <span className="timewindow-text">
            <span>{`${startRange} day${startRange === 1 ? '' : 's'} ago`}</span>
            <span>{`${endRange} day${endRange === 1 ? '' : 's'} ago`}</span>
          </span>
          <Divider />
          <span className="input-label">ORGANIZATIONS</span>
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
          <Divider />
          <span className="input-label">PEOPLE</span>
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
          <Divider />
          <span className="input-label">SENTIMENT</span>
          <Dropdown
              // text="Sentiment"
              // icon="smile"
              // className="icon little-width"
            defaultValue="none"
            options={sentimentsOptions}
            onChange={(_, { value }) => {
              this.props.changeSentimentFilter(value);
              this.props.fetchArticles(center, zoom, bounds);
            }}
            search
            upward
            selection
            fluid
          />
          <Divider />
          <span className="input-label">POPULAR IN</span>
          <Dropdown
            text="Popular in..."
                  // icon="internet explorer"
                  // className="icon"
            options={this.state.popularSocialOptions}
            onChange={(_, { value }) => {
              if (value[0] === 'all') {
                this.setState({ popularSocialOptions: popularSocialOptions[0] });
              } else if (!value.length) {
                this.setState({ popularSocialOptions });
              } else {
                this.setState({
                  popularSocialOptions: popularSocialOptions.slice(0),
                });
              }
              this.props.changePopularSocialsFilter(value);
              this.props.fetchArticles(center, zoom, bounds);
            }}
            upward
            search
            selection
            fluid
            multiple
            allowAdditions
          />
          <span className="input-label">POPULAR TOP</span>
          <Dropdown
            icon="sort"
            className="icon"
            defaultValue="100"
            options={popularTopOptions}
            onChange={(_, { value }) => {
              this.props.changePopularTopFilter(value);
              this.props.fetchArticles(center, zoom, bounds);
            }}
            fluid
            upward
            labeled
            button
            selection
          />
          <div className="popular-container">
            <div className="popular-in-container" />
            <div className="popular-top-container" />
          </div>

        </div>
      </Segment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

