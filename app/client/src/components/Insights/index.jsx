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
  openModal,
  closeModal,
} from '../../modules/insights';
import { getLineDataset } from '../../utils';

const mapStateToProps = ({
  insights: {
    sentiment,
    categories,
    topPeople,
    topOrgs,
    topLocations,
    topKeywords,
    fetchStatus,
    isModalOpen,
  },
  mapArticles: {
    articles,
    focusedOn,
  },
}) => ({
  isFocused: Boolean(focusedOn),
  ids: articles.map((article) => article.id).join(),
  sentiment,
  categories,
  topPeople,
  topOrgs,
  topLocations,
  topKeywords,
  fetchStatus,
  isModalOpen,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
  openModal,
  closeModal,
}, dispatch);

class Insights extends Component {
  render() {
    const {
      ids,
      sentiment,
      categories,
      topKeywords,
      topPeople,
      topLocations,
      topOrgs,
      isModalOpen,
      isFocused,
    } = this.props;
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
        {!isModalOpen && !isFocused ? (
          <Button
            content="Insights"
            icon="bar chart"
            labelPosition="left"
            onClick={() => {
              this.props.openModal();
              this.props.fetchTopInsights(ids, 'people', 10);
              this.props.fetchTopInsights(ids, 'organizations', 10);
              this.props.fetchTopInsights(ids, 'locations', 10);
              this.props.fetchTopInsights(ids, 'keywords', 300);
              this.props.fetchSentimentInsights(ids);
              this.props.fetchCategoriesInsights(ids);
            }}
          />
        ) : null}
        <Modal
          open={isModalOpen}
          onClose={this.props.closeModal}
          closeOnDimmerClick
        >
          <Modal.Header>Insights</Modal.Header>
          <Modal.Content scrolling>
            Sentiment
            <Line data={sentimentLineData} />
            <Pie data={sentimentPieData} />
            Categories
            <Line data={categoriesLineData} />
            <Pie data={categoriesPieData} />
            <HorizontalBar data={categoriesBarData} />
            word cloud
            <WordCloud
              font="lato"
              width={700}
              height={500}
              // padding={(word) => word.value / 10}
              data={topKeywords.map(({ keyword, count }) => ({
                text: keyword,
                value: count,
              }))}
              fontSizeMapper={(word) => (word.value * 1000) / 80}
              rotate={(word) => ((word.value * (Math.random() * 100)) % 90) - 45}
            />
            top 10
            <HorizontalBar data={peopleBarData} />
            <HorizontalBar data={orgsBarData} />
            <HorizontalBar data={locationsBarData} />

          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={this.props.closeModal}
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
