import React, { Component } from 'react';
import { Input, Icon, Label, Segment, Dropdown } from 'semantic-ui-react';
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

const popularTopOptions = [
  { key: '100', text: '100', value: '100' },
  { key: '300', text: '300', value: '300' },
  { key: '500', text: '500', value: '500' },
  { key: '1000', text: '1000', value: '1000' },
];

class Filter extends Component {
  state = {
    popularSocialOptions: [
      { key: 'all', text: 'All', value: 'all' },
      { key: 'facebook', text: 'Facebook', value: 'facebook' },
      { key: 'reddit', text: 'Reddit', value: 'reddit' },
      { key: 'linkedin', text: 'LinkedIn', value: 'linkedin' },
      { key: 'pinterest', text: 'Pinterest', value: 'pinterest' },
      { key: 'stumbleupon', text: 'StumbleUpon', value: 'stumbleupon' },
    ],
  }

  render() {
    const {
      filters,
      mapState: { center, zoom, bounds },
    } = this.props;
    const {
      keywords,
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
            <br />
            keywords -
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
            categories -
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
            orgs -
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
            pips -
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
            sentiment -
            <Dropdown
              placeholder="Sentiment"
              defaultValue="none"
              options={sentimentsOptions}
              onChange={(_, { value }) => {
                this.props.changeSentimentFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              fluid
            />
            Popular social -
            <Dropdown
              placeholder="Popular"
              options={this.state.popularSocialOptions}
              onChange={(_, { value }) => {
                if (value[0] === 'all') {
                  this.setState({ popularSocialOptions: [{ key: 'all', text: 'All', value: 'all' }] });
                } else if (!value.length) {
                  this.setState({
                    popularSocialOptions: [
                      { key: 'all', text: 'All', value: 'all' },
                      { key: 'facebook', text: 'Facebook', value: 'facebook' },
                      { key: 'reddit', text: 'Reddit', value: 'reddit' },
                      { key: 'linkedin', text: 'LinkedIn', value: 'linkedin' },
                      { key: 'pinterest', text: 'Pinterest', value: 'pinterest' },
                      { key: 'stumbleupon', text: 'StumbleUpon', value: 'stumbleupon' },
                    ],
                  });
                } else {
                  this.setState({
                    popularSocialOptions: [
                      { key: 'facebook', text: 'Facebook', value: 'facebook' },
                      { key: 'reddit', text: 'Reddit', value: 'reddit' },
                      { key: 'linkedin', text: 'LinkedIn', value: 'linkedin' },
                      { key: 'pinterest', text: 'Pinterest', value: 'pinterest' },
                      { key: 'stumbleupon', text: 'StumbleUpon', value: 'stumbleupon' },
                    ],
                  });
                }
                this.props.changePopularSocialsFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              multiple
              fluid
            />
            Popular top -
            <Dropdown
              placeholder="Popular top"
              defaultValue="100"
              options={popularTopOptions}
              onChange={(_, { value }) => {
                this.props.changePopularTopFilter(value);
                this.props.fetchArticles(center, zoom, bounds);
              }}
              search
              selection
              // fluid
            />

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

