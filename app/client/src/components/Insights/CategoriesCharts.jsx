import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { HorizontalBar, Line, Pie } from 'react-chartjs-2';
import { getLineDataset } from '../../utils';

const ActiveMenuItem = ({
  activeItem,
  categoriesLineData,
  categoriesPieData,
  categoriesBarData,
}) => {
  switch (activeItem) {
    case 'line': {
      return <Line data={categoriesLineData} />;
    }
    case 'pie': {
      return <Pie data={categoriesPieData} />;
    }
    case 'horizontal': {
      return <HorizontalBar data={categoriesBarData} />;
    }
    default:
      return <p>No Item</p>;
  }
};

class CategoriesCharts extends Component {
  state = { activeItem: 'line' };

  componentDidMount() {
    console.log(this.props);
    this.props.fetchCategoriesInsights();
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;
    const {
      categories = [],
    } = this.props;

    const categoriesLineData = {
      labels: categories.labels,
      datasets: getLineDataset([
        {
          label: 'Crime',
          color: '234,95,72',
          data: categories.crimeCount,
        },
        {
          label: 'Culture',
          color: '41,199,202',
          data: categories.cultureCount,
        },
        {
          label: 'Economy',
          color: '174,18,255',
          data: categories.econCount,
        },
        {
          label: 'Environment',
          color: '121,255,59',
          data: categories.envCount,
        },
        {
          label: 'Health',
          color: '255,63,53',
          data: categories.healthCount,
        },
        {
          label: 'Lifestyle',
          color: '255,253,0',
          data: categories.lifeCount,
        },
        {
          label: 'Sports',
          color: '135,60,13',
          data: categories.sportsCount,
        },
        {
          label: 'Weather',
          color: '255,43,138',
          data: categories.weatherCount,
        },
        {
          label: 'Politics',
          color: '255,114,24',
          data: categories.polCount,
        },
        {
          label: 'Business & Finance',
          color: '106,125,143',
          data: categories.busFinCount,
        },
        {
          label: 'Disaster & Accident',
          color: '6,255,0',
          data: categories.disAccCount,
        },
        {
          label: 'Entertainment & Arts',
          color: '232,105,144',
          data: categories.entArtCount,
        },
        {
          label: 'Law & Government',
          color: '113,95,127',
          data: categories.lawGovCount,
        },
        {
          label: 'Science & Technology',
          color: '40,127,0',
          data: categories.sciTechCount,
        },
      ]),
    };
    const categoriesPieData = {
      labels: [
        'Crime',
        'Culture',
        'Economy',
        'Environment',
        'Health',
        'Lifestyle',
        'Politics',
        'Sports',
        'Weather',
        'Business & Finance',
        'Disaster & Accident',
        'Entertainment & Arts',
        'Law & Government',
        'Science & Technology',
      ],
      datasets: [{
        data: [
          categories.crimeCount.reduce((a, b) => (a + b), 0),
          categories.cultureCount.reduce((a, b) => (a + b), 0),
          categories.econCount.reduce((a, b) => (a + b), 0),
          categories.envCount.reduce((a, b) => (a + b), 0),
          categories.healthCount.reduce((a, b) => (a + b), 0),
          categories.lifeCount.reduce((a, b) => (a + b), 0),
          categories.polCount.reduce((a, b) => (a + b), 0),
          categories.sportsCount.reduce((a, b) => (a + b), 0),
          categories.weatherCount.reduce((a, b) => (a + b), 0),
          categories.busFinCount.reduce((a, b) => (a + b), 0),
          categories.disAccCount.reduce((a, b) => (a + b), 0),
          categories.entArtCount.reduce((a, b) => (a + b), 0),
          categories.lawGovCount.reduce((a, b) => (a + b), 0),
          categories.sciTechCount.reduce((a, b) => (a + b), 0),
        ],
        backgroundColor: [
          '#EA5F48',
          '#29C7CA',
          '#AE12FF',
          '#79FF3B',
          '#FF3F35',
          '#FFFD00',
          '#247DE8',
          '#873C0D',
          '#FF2B8A',
          '#FF7218',
          '#6A7D8F',
          '#06FF00',
          '#E86990',
          '#715F7F',
          '#287F00',
        ],
      }],
    };
    const categoriesBarData = {
      type: 'horizontalBar',
      labels: [
        'Crime',
        'Culture',
        'Economy',
        'Environment',
        'Health',
        'Lifestyle',
        'Politics',
        'Sports',
        'Weather',
        'Business & Finance',
        'Disaster & Accident',
        'Entertainment & Arts',
        'Law & Government',
        'Science & Technology',
      ],
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
          data: [
            categories.econCount.reduce((a, b) => (a + b), 0),
            categories.lifeCount.reduce((a, b) => (a + b), 0),
            categories.sportsCount.reduce((a, b) => (a + b), 0),
            categories.polCount.reduce((a, b) => (a + b), 0),
            categories.healthCount.reduce((a, b) => (a + b), 0),
            categories.crimeCount.reduce((a, b) => (a + b), 0),
            categories.weatherCount.reduce((a, b) => (a + b), 0),
            categories.cultureCount.reduce((a, b) => (a + b), 0),
            categories.envCount.reduce((a, b) => (a + b), 0),
            categories.busFinCount.reduce((a, b) => (a + b), 0),
            categories.disAccCount.reduce((a, b) => (a + b), 0),
            categories.entArtCount.reduce((a, b) => (a + b), 0),
            categories.lawGovCount.reduce((a, b) => (a + b), 0),
            categories.sciTechCount.reduce((a, b) => (a + b), 0),
          ],
        },
      ],
    };

    return (
      <div>
        <Menu pointing secondary>
          <Menu.Item name="line" active={activeItem === 'line'} onClick={this.changeItem} />
          <Menu.Item name="pie" active={activeItem === 'pie'} onClick={this.changeItem} />
          <Menu.Item name="horizontal" active={activeItem === 'horizontal'} onClick={this.changeItem} />
        </Menu>
        <ActiveMenuItem
          activeItem={activeItem}
          categoriesLineData={categoriesLineData}
          categoriesPieData={categoriesPieData}
          categoriesBarData={categoriesBarData}
        />
      </div>
    );
  }
}

export default CategoriesCharts;
