import React, { Component } from 'react';
import { Label, Segment, Dropdown, Divider, Button, Icon } from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Slider from 'rc-slider';
import DatePicker from 'react-datepicker';
import { fetchBoundArticles } from '../../modules/mapArticles';
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
  changeTimeWindowFilter,
  changeDateFilter,
  clearFilters,
} from '../../modules/filters';
import { mapOptions } from '../../utils';
import './styles.css';

const mapStateToProps = ({
  filters,
}) => ({
  filters,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changeTimeWindowFilter,
  changeLimitFilter,
  changeOrganizationsFilter,
  changePeopleFilter,
  changePopularSocialsFilter,
  changePopularTopFilter,
  changeSentimentFilter,
  fetchBoundArticles,
  changeDateFilter,
  clearFilters,
}, dispatch);

const categoriesOptions = [
  { key: 'Arts & Entertainment', text: 'Arts & Entertainment', value: 'Arts & Entertainment' },
  { key: 'Business & Finance', text: 'Business & Finance', value: 'Business & Finance' },
  { key: 'Crime', text: 'Crime', value: 'Crime' },
  { key: 'Disaster & Accident', text: 'Disaster & Accident', value: 'Disaster & Accident' },
  { key: 'Economy', text: 'Economy', value: 'Economy' },
  { key: 'Environment', text: 'Environment', value: 'Environment' },
  { key: 'Health', text: 'Health', value: 'Health' },
  { key: 'Law & Government', text: 'Law & Government', value: 'Law & Government' },
  { key: 'Lifestyle', text: 'Lifestyle', value: 'Lifestyle' },
  { key: 'Politics', text: 'Politics', value: 'Politics' },
  { key: 'Science & Technology', text: 'Science & Technology', value: 'Science & Technology' },
  { key: 'Sports', text: 'Sports', value: 'Sports' },
  { key: 'Weather', text: 'Weather', value: 'Weather' },
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
  { key: '10', text: '10', value: '10' },
  { key: '30', text: '30', value: '30' },
  { key: '50', text: '50', value: '50' },
  { key: '100', text: '100', value: '100' },
  { key: '300', text: '300', value: '300' },
  { key: '500', text: '500', value: '500' },
];

const FilterAlert = ({ action }) => (
  <div>
    <Icon
      name={`${action === 'save' ? 'check' : 'delete'}`}
      color={`${action === 'save' ? 'green' : 'red'}`}
      size="large"
    />
    Preference has been {`${action === 'save' ? 'saved' : 'cleared'}`}
  </div>
);

const now = new Date();

class Filter extends Component {
  state = { popularSocialOptions }

  render() {
    const { filters } = this.props;
    const {
      keywords,
      sources,
      people,
      organizations,
      timeWindow,
      limit,
      categories,
      date,
    } = filters;
    const startRange = 31 - timeWindow[0];
    const endRange = 31 - timeWindow[1];

    return (
      <Segment className="filter-segment-container">
        <Label as="a" color="teal" ribbon style={{ marginBottom: '1rem' }}>Preferences</Label>
        <div className="filter-scrollable">
          <Button.Group labeled icon>
            <Tooltip
              html={<FilterAlert action="save" />}
              trigger="click"
              duration={1000}
              hideDelay={2000}
              animation="scale"
            >
              <Button
                className="save-button-filter"
                icon="save"
                content="Save"
                labelPosition="left"
                color="blue"
                onClick={() => localStorage.setItem('filterSettings', JSON.stringify(this.props.filters))}
              />
            </Tooltip>
            <Tooltip
              html={<FilterAlert action="clear" />}
              trigger="click"
              duration={1000}
              hideDelay={2000}
              animation="scale"
            >
              <Button
                icon="delete"
                labelPosition="left"
                content="Clear"
                color="default"
                onClick={() => {
                  this.props.clearFilters();
                  this.props.fetchBoundArticles();
                  localStorage.removeItem('filterSettings');
                }}
              />
            </Tooltip>
          </Button.Group>
          <Divider />
          <span className="input-label">SEARCH KEYWORDS</span>
          <Dropdown
            placeholder="Keywords"
            icon="search"
            noResultsMessage="Add keywords"
            options={keywords.map(mapOptions)}
            value={keywords}
            onChange={(_, { value }) => {
              this.props.changeKeywordsFilter(value);
              this.props.fetchBoundArticles();
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
              this.props.fetchBoundArticles();
            }}
            value={categories}
            search
            selection
            fluid
            multiple
          />
          <Divider />
          <span className="input-label">SOURCES</span>
          <Dropdown
            text="Source"
            // icon="browser"
            // className="icon half-width"
            noResultsMessage="Add sources"
            options={sources.map(mapOptions)}
            value={sources}
            onChange={(_, { value }) => {
              this.props.changeSourcesFilter(value);
              this.props.fetchBoundArticles();
            }}
            search
            selection
            fluid
            multiple
            allowAdditions
          />
          <Divider />
          <span className="input-label">DATE</span>
          <div className="ui input fluid">
            <div className="filter-datepicker-wrapper">
              <DatePicker
                className="filter-datepicker"
                dateFormat="MMMM D, YYYY"
                selected={date}
                maxDate={now}
                onChange={(newDate) => {
                  this.props.changeDateFilter(newDate);
                  this.props.fetchBoundArticles();
                }}
                showMonthDropdown
                showYearDropdown
              />
            </div>
          </div>
          <span className="input-label">TIME WINDOW</span>
          <Slider.Range
            min={0}
            max={31}
            allowCross={false}
            value={timeWindow}
            onChange={(value) => {
              this.props.changeTimeWindowFilter(value);
              this.props.fetchBoundArticles();
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
            noResultsMessage="Add organizations"
            options={organizations.map(mapOptions)}
            value={organizations}
            onChange={(_, { value }) => {
              this.props.changeOrganizationsFilter(value);
              this.props.fetchBoundArticles();
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
            noResultsMessage="Add people"
            options={people.map(mapOptions)}
            value={people}
            onChange={(_, { value }) => {
              this.props.changePeopleFilter(value);
              this.props.fetchBoundArticles();
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
              this.props.fetchBoundArticles();
            }}
            search
            upward
            selection
            fluid
          />
          <Divider />
          <span className="input-label">COUNT (<b>{limit}</b>)</span>
          <Slider
            min={0}
            max={10000}
            value={limit}
            onChange={(value) => {
              this.props.changeLimitFilter(value);
              this.props.fetchBoundArticles();
            }}
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
                this.setState({ popularSocialOptions: [popularSocialOptions[0]] });
              } else if (!value.length) {
                this.setState({ popularSocialOptions });
              } else {
                this.setState({
                  popularSocialOptions: popularSocialOptions.slice(0),
                });
              }
              this.props.changePopularSocialsFilter(value);
              this.props.fetchBoundArticles();
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
              this.props.fetchBoundArticles();
            }}
            fluid
            upward
            labeled
            button
            selection
          />
        </div>
      </Segment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Filter);

