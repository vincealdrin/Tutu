import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { HorizontalBar } from 'react-chartjs-2';
import { getLineDataset, getBarChartOptions } from '../../utils';

class TopTen extends Component {
  state = { activeItem: 'people' };

  componentDidMount() {
    this.props.fetchTopInsights('people');
    this.props.fetchTopInsights('organizations');
    this.props.fetchTopInsights('locations');
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  renderActiveItem = (
    peopleBarData,
    orgsBarData,
    locationsBarData,
  ) => {
    const {
      isDatalabelShown,
      peopleStatus,
      orgsStatus,
      locationsStatus,
    } = this.props;
    const { activeItem } = this.state;

    switch (activeItem) {
      case 'people': {
        return (
          <HorizontalBar
            data={peopleBarData}
            options={getBarChartOptions(isDatalabelShown)}
            redraw={!peopleStatus.pending}
          />
        );
      }
      case 'organizations': {
        return (
          <HorizontalBar
            data={orgsBarData}
            options={getBarChartOptions(isDatalabelShown)}
            redraw={!orgsStatus.pending}
          />
        );
      }
      case 'locations': {
        return (
          <HorizontalBar
            data={locationsBarData}
            options={getBarChartOptions(isDatalabelShown)}
            redraw={!locationsStatus.pending}
          />
        );
      }
      default:
        return <p>No Item</p>;
    }
  };

  render() {
    const { activeItem } = this.state;
    const {
      topPeople = [],
      topLocations = [],
      topOrgs = [],
    } = this.props;

    const peopleBarData = {
      type: 'horizontalBar',
      labels: topPeople.map(({ person }) => person),
      datasets: [
        {
          label: 'Count',
          backgroundColor: [
            'rgba(255,99,132,0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
          ],
          hoverBackgroundColor: [
            'rgba(255,99,132,0.4)',
          ],
          hoverBorderColor: [
            'rgba(255,99,132,1)',
          ],
          borderWidth: 1,
          barThickness: 1,
          data: topPeople.map(({ count }) => count),
        },
      ],
    };
    const locationsBarData = {
      type: 'horizontalBar',
      labels: topLocations.map(({ location }) => location.replace(', Philippines', '')),
      datasets: [
        {
          label: 'Count',
          backgroundColor: [
            'rgba(255,99,132,0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
          ],
          hoverBackgroundColor: [
            'rgba(255,99,132,0.4)',
          ],
          hoverBorderColor: [
            'rgba(255,99,132,1)',
          ],
          borderWidth: 1,
          barThickness: 1,
          data: topLocations.map(({ count }) => count),
        },
      ],
    };
    const orgsBarData = {
      type: 'horizontalBar',
      labels: topOrgs.map(({ organization }) => organization),
      datasets: [
        {
          label: 'Count',
          backgroundColor: [
            'rgba(255,99,132,0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
          ],
          hoverBackgroundColor: [
            'rgba(255,99,132,0.4)',
          ],
          hoverBorderColor: [
            'rgba(255,99,132,1)',
          ],
          borderWidth: 1,
          barThickness: 1,
          data: topOrgs.map(({ count }) => count),
        },
      ],
    };

    return (
      <div>
        <Menu pointing secondary>
          <Menu.Item name="people" active={activeItem === 'people'} onClick={this.changeItem} />
          <Menu.Item name="organizations" active={activeItem === 'organizations'} onClick={this.changeItem} />
          <Menu.Item name="locations" active={activeItem === 'locations'} onClick={this.changeItem} />
        </Menu>
        {this.renderActiveItem(peopleBarData, orgsBarData, locationsBarData)}
      </div>
    );
  }
}

export default TopTen;
