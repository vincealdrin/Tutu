import React, { PureComponent } from 'react';
import { Label, Segment, Dropdown, Divider, Button, Icon } from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Slider from 'rc-slider';
import DatePicker from 'react-datepicker';
import {
  changeCategoriesFilter,
  changeKeywordsFilter,
  changeLimitFilter,
  changeTopPopular,
  changeSentimentFilter,
  changeSourcesFilter,
  changeTimeWindowFilter,
  changeDateFilter,
  clearFilters,
  changeAuthorsFilter,
} from '../../modules/filters';
import { mapOptions } from '../../utils';
import './styles.css';

const mapStateToProps = ({
  filters,
}, { fetchArticles, hideCount }) => ({
  filters,
  fetchArticles,
  hideCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  changeKeywordsFilter,
  changeCategoriesFilter,
  changeSourcesFilter,
  changeTimeWindowFilter,
  changeLimitFilter,
  changeTopPopular,
  changeSentimentFilter,
  changeDateFilter,
  clearFilters,
  changeAuthorsFilter,
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

const popularTopOptions = [
  { key: 'none', text: 'None', value: 'none' },
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

class Filter extends PureComponent {
  render() {
    const {
      filters,
      fetchArticles,
      hideCount,
    } = this.props;
    const {
      keywords,
      sources,
      authors,
      timeWindow,
      limit,
      categories,
      date,
      topPopular,
      sentiment,
    } = filters;
    const startRange = 31 - timeWindow[0];
    const endRange = 31 - timeWindow[1];

    return (
      <Segment className="filter-segment-container">
        <Label as="a" color="teal" ribbon style={{ marginBottom: '1rem' }}>Preferences</Label>
        <div className="filter-scrollable">
          <Button.Group labeled icon>
            <Tooltip
              title="Loading..."
              trigger="click"
              duration={500}
              hideDelay={900}
              animation="scale"
            >
              <Button
                className="save-button-filter"
                icon="play"
                content="Run"
                labelPosition="left"
                onClick={() => {
                  fetchArticles();
                }}
                color="green"
              />
            </Tooltip>

          </Button.Group>
          <Button.Group>
            <Tooltip
              html={<FilterAlert action="save" />}
              trigger="click"
              duration={500}
              hideDelay={900}
              animation="scale"
            >
              <Button
                className="save-button-filter"
                icon="save"
                content="Save"
                labelPosition="left"
                onClick={() => localStorage.setItem('filterSettings', JSON.stringify(filters))}
                color="blue"
              />
            </Tooltip>
            <Tooltip
              html={<FilterAlert action="clear" />}
              trigger="click"
              duration={500}
              hideDelay={900}
              animation="scale"
              onShown={() => {
                this.props.clearFilters();
                localStorage.removeItem('filterSettings');
              }}
            >
              <Button
                icon="delete"
                labelPosition="left"
                content="Clear"
                color="default"
              />
            </Tooltip>
          </Button.Group>
          <Divider />
          <span className="input-label">SEARCH</span>
          <Dropdown
            placeholder="Add keywords to filter results"
            icon="search"
            noResultsMessage="Add keyword"
            options={keywords.map(mapOptions)}
            value={keywords}
            onChange={(_, { value }) => {
              this.props.changeKeywordsFilter(value);
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
            text="Sources"
            // icon="browser"
            // className="icon half-width"
            noResultsMessage="Add source"
            options={sources.map(mapOptions)}
            value={sources}
            onChange={(_, { value }) => {
              this.props.changeSourcesFilter(value);
            }}
            search
            selection
            fluid
            multiple
            allowAdditions
          />
          <Divider />
          <span className="input-label">AUTHORS</span>
          <Dropdown
            text="Authors"
            // icon="browser"
            // className="icon half-width"
            noResultsMessage="Add author"
            options={authors.map(mapOptions)}
            value={authors}
            onChange={(_, { value }) => {
              this.props.changeAuthorsFilter(value);
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
            }}
          />
          <span className="timewindow-text">
            <span>{`${startRange} day${startRange === 1 ? '' : 's'} ago`}</span>
            <span>{`${endRange} day${endRange === 1 ? '' : 's'} ago`}</span>
          </span>
          <Divider />
          <span className="input-label">SENTIMENT</span>
          <Dropdown
            // text="Sentiment"
            // icon="smile"
            // className="icon little-width"
            value={sentiment}
            options={sentimentsOptions}
            onChange={(_, { value }) => {
              if (value !== sentiment) {
                this.props.changeSentimentFilter(value);
              }
            }}
            search
            upward
            selection
            fluid
          />
          <Divider />
          {!hideCount ? (
            <div>
              <span className="input-label">COUNT (<b>{limit}</b>)</span>
              <Slider
                min={0}
                max={10000}
                value={limit}
                onChange={(value) => {
                  this.props.changeLimitFilter(value);
                }}
              />
              <Divider />
            </div>
          ) : null}
          <span className="input-label">POPULAR TOP</span>
          <Dropdown
            icon="sort"
            value={topPopular}
            options={popularTopOptions}
            onChange={(_, { value }) => {
              if (value !== topPopular) {
                this.props.changeTopPopular(value);
              }
            }}
            search
            upward
            selection
            fluid
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

