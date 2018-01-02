import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Modal } from 'semantic-ui-react';
import { HorizontalBar, Bar, Line, Pie } from 'react-chartjs-2';
import WordCloud from 'react-d3-cloud';
import {
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
} from '../../modules/insights';
import { getLineDataset } from '../../utils';

const mapStateToProps = ({
  insights: {
    sentiment,
    categories,
    topPeople,
    topOrgs,
    topLocations,
    topkeywords,
    fetchStatus,
  },
  mapArticles: {
    articles,
  },
}) => ({
  sentiment,
  categories,
  topPeople,
  topOrgs,
  topLocations,
  topkeywords,
  fetchStatus,
  ids: articles.map((article) => article.id).join(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
}, dispatch);

class Insights extends Component {
  state = { isOpen: false }

  openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

  render() {
    const {
      ids,
      sentiment,
      categories,
    } = this.props;
    const { isOpen } = this.state;
    const sentimentLineData = {
      labels: sentiment.labels,
      datasets: getLineDataset([
        {
          label: 'Positive',
          color: '75,192,192',
          data: sentiment.posCount,
        },
        {
          label: 'Neutral',
          color: '106,125,143',
          data: sentiment.neuCount,
        },
        {
          label: 'Negative',
          color: '255,99,132',
          data: sentiment.negCount,
        },
      ]),
    };
    const sentimentPieData = {
      labels: [
        'Positive',
        'Neutral',
        'Negative',
      ],
      datasets: [{
        data: [
          sentiment.posCount.reduce((a, b) => (a + b), 0),
          sentiment.neuCount.reduce((a, b) => (a + b), 0),
          sentiment.negCount.reduce((a, b) => (a + b), 0),
        ],
        backgroundColor: [
          '#4bc0c0',
          '#6a7d8f',
          '#FF6384',
        ],
      }],
    };

    const categoriesLineData = {
      labels: categories.labels,
      datasets: getLineDataset([
        {
          label: 'Crime',
          color: '255,99,132',
          data: categories.crimeCount,
        },
        {
          label: 'Culture',
          color: '106,125,143',
          data: categories.cultureCount,
        },
        {
          label: 'Economy',
          color: '75,192,192',
          data: categories.econCount,
        },
        {
          label: 'Environment',
          color: '75,192,192',
          data: categories.envCount,
        },
        {
          label: 'Health',
          color: '106,125,143',
          data: categories.healthCount,
        },
        {
          label: 'Lifestyle',
          color: '106,125,143',
          data: categories.lifeCount,
        },
        {
          label: 'Nation',
          color: '255,99,132',
          data: categories.nationCount,
        },
        {
          label: 'Sports',
          color: '255,99,132',
          data: categories.sportsCount,
        },
        {
          label: 'Weather',
          color: '75,192,192',
          data: categories.weatherCount,
        },
        {
          label: 'Politics',
          color: '75,192,192',
          data: categories.polCount,
        },
        {
          label: 'Business & Finance',
          color: '106,125,143',
          data: categories.busFinCount,
        },
        {
          label: 'Disaster & Accident',
          color: '255,99,132',
          data: categories.disAccCount,
        },
        {
          label: 'Entertainment & Arts',
          color: '255,99,132',
          data: categories.entArtCount,
        },
        {
          label: 'Law & Government',
          color: '255,99,132',
          data: categories.lawGovCount,
        },
        {
          label: 'Science & Technology',
          color: '255,99,132',
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
        'Nation',
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
          categories.nationCount.reduce((a, b) => (a + b), 0),
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
          '#4bc0c0',
          '#6a7d8f',
          '#FF6384',
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
        'Nation',
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
          label: 'Category',
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
            categories.nationCount.reduce((a, b) => (a + b), 0),
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
        <Button
          content="Insights"
          icon="bar chart"
          labelPosition="left"
          onClick={() => {
            this.openModal();
            this.props.fetchTopInsights(ids, 'people', 10);
            this.props.fetchTopInsights(ids, 'organizations', 10);
            this.props.fetchTopInsights(ids, 'locations', 10);
            this.props.fetchTopInsights(ids, 'keywords', 1000);
            this.props.fetchSentimentInsights(ids);
            this.props.fetchCategoriesInsights(ids);
          }}
        />
        <Modal
          open={isOpen}
          onClose={this.closeModal}
          closeOnDimmerClick
        >
          <Modal.Header>Insights</Modal.Header>
          <Modal.Content>
            Sentiment
            <Line data={sentimentLineData} />
            <Pie data={sentimentPieData} />
            Categories
            <Line data={categoriesLineData} />
            <Pie data={categoriesPieData} />
            <HorizontalBar data={categoriesBarData} />
            word cloud
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={this.closeModal}
              content="Close"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);
