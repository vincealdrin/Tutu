import React, { Component } from 'react';
import { Header, Menu } from 'semantic-ui-react';
import { HorizontalBar } from 'react-chartjs-2';
import { getLineDataset } from '../../utils';

const ActiveMenuItem = ({
	activeItem,
	peopleBarData,
	orgsBarData,
	locationsBarData
	}) => {
	let theItem;
	switch (activeItem) {
		case 'people': {
			theItem = <HorizontalBar data={peopleBarData} />
			break;
		}
		case 'orgs': {
			theItem = <HorizontalBar data={orgsBarData} />
			break;
		}
		case 'locations': {
			theItem = <HorizontalBar data={locationsBarData} />
			break;
		}
		default:
			<p>No Item</p>
	}
	return (
	<div>
		{theItem}
	</div>
	)
}

class TopTen extends Component {
	state = { activeItem: 'people' };

	changeItem = (_, { name }) => this.setState({ activeItem: name });
	render() {
		const { activeItem } = this.state;
		const {
			topPeople = [],
			topLocations = [],
			topOrgs = []
		} = this.props;

		const peopleBarData = {
      type: 'horizontalBar',
      labels: topPeople.map(({ person }) => person),
      datasets: [
        {
          label: 'Person',
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
      labels: topLocations.map(({ location }) => location),
      datasets: [
        {
          label: 'Location',
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
    const orgsBarData = {
      type: 'horizontalBar',
      labels: topOrgs.map(({ organization }) => organization),
      datasets: [
        {
          label: 'Organization',
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

		return (
			<div>
				<Menu pointing secondary>
					<Menu.Item name="people" active={activeItem === 'people'} onClick={this.changeItem} />
					<Menu.Item name="orgs" active={activeItem === 'orgs'} onClick={this.changeItem} />
					<Menu.Item name="locations" active={activeItem === 'locations'} onClick={this.changeItem} />
				</Menu>
				<ActiveMenuItem
					activeItem={activeItem}
					peopleBarData={peopleBarData}
					orgsBarData={orgsBarData}
					locationsBarData={locationsBarData}
				/>
			</div>
		)
	}
}

export default TopTen;
