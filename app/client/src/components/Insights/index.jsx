import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Modal, Header, Divider } from 'semantic-ui-react';
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
          color: '41,199,202',
          data: sentiment.posCount,
        },
        {
          label: 'Neutral',
          color: '70,76,88',
          data: sentiment.neuCount,
        },
        {
          label: 'Negative',
          color: '234,95,72',
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
          '#29c7ca',
          '#464c58',
          '#ea5f48',
        ],
      }],
    };

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
          label: 'Nation',
          color: '36,125,232',
          data: categories.nationCount,
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
            <Header as="h2" className="insight-header">Sentiment</Header>
            <Line data={sentimentLineData} />
            <Pie data={sentimentPieData} />

            <Divider />

            <Header as="h2" className="insight-header">Categories</Header>
            <Line data={categoriesLineData} />
            <Pie data={categoriesPieData} />
            <HorizontalBar data={categoriesBarData} />

            <Divider />

            <Header as="h2">Word Cloud</Header>
            <div className="word-cloud">
              <WordCloud
                font="lato"
                width={700}
                height={500}
                // padding={(word) => word.value / 10}
                data={topKeywords.map(({ keyword, count }) => ({
                  text: keyword,
                  value: count,
                }))}
                fontSizeMapper={(word) => Math.log2(word.value) * 10}
                rotate={(word) => word.value % 360}
              />
            </div>

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
