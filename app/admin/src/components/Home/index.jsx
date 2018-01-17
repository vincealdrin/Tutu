import { HorizontalBar, Line, Pie, Bar } from 'react-chartjs-2';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Grid, Segment, Label } from 'semantic-ui-react';
import WordCloud from 'react-d3-cloud';
import Statistics from './Statistics';
import {
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
  fetchCounts,
  fetchSourcesSubmit,
} from '../../modules/dashboard';
import './styles.css';
import { getLineDataset } from '../../utils';

const mapStateToProps = ({
  dashboard: {
    sentiment,
    categories,
    topPeople,
    topOrgs,
    topLocations,
    topKeywords,
    counts,
    sourcesSubmit,
  },
  socket,
}) => ({
  counts,
  sentiment,
  categories,
  topPeople,
  topOrgs,
  topLocations,
  topKeywords,
  socket,
  sourcesSubmit,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
  fetchCounts,
  fetchSourcesSubmit,
}, dispatch);


class Home extends Component {
  componentDidMount() {
    this.props.fetchCounts();
    this.props.fetchSentimentInsights();
    this.props.fetchTopInsights('people');
    this.props.fetchTopInsights('organizations');
    this.props.fetchTopInsights('locations');
    this.props.fetchTopInsights('keywords', 200);
    this.props.fetchCategoriesInsights();
    this.props.fetchSourcesSubmit();
  }

  render() {
    const {
      categories = [],
      sentiment = [],
      topPeople = [],
      topLocations = [],
      topOrgs = [],
      topKeywords = [],
      sourcesSubmit = {
        pendingSources: [],
        verifiedSources: [],
      },
      counts,
    } = this.props;

    const wordCloud = topKeywords.map(({ keyword, count }) => ({
      text: keyword,
      value: count,
    }));

    const pendingSourcesBarData = {
      type: 'horizontalBar',
      labels: sourcesSubmit.pendingSources.labels,
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
          data: sourcesSubmit.pendingSources.pendingCount,
        },
      ],
    };

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

    const verifiedSourcesLineData = {
      labels: sourcesSubmit.verifiedSources.labels,
      datasets: getLineDataset([
        {
          label: 'Legitimate',
          color: '41,199,202',
          data: sourcesSubmit.verifiedSources.legitimateCount,
        },
        {
          label: 'Illegitimate',
          color: '234,95,72',
          data: sourcesSubmit.verifiedSources.illegitimateCount,
        },
      ]),
    };

    // const sentimentLineData = {
    //   labels: sentiment.labels,
    //   datasets: getLineDataset([
    //     {
    //       label: 'Positive',
    //       color: '41,199,202',
    //       data: sentiment.posCount,
    //     },
    //     {
    //       label: 'Neutral',
    //       color: '70,76,88',
    //       data: sentiment.neuCount,
    //     },
    //     {
    //       label: 'Negative',
    //       color: '234,95,72',
    //       data: sentiment.negCount,
    //     },
    //   ]),
    // };
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
    // const categoriesPieData = {
    //   labels: [
    //     'Crime',
    //     'Culture',
    //     'Economy',
    //     'Environment',
    //     'Health',
    //     'Lifestyle',
    //     'Politics',
    //     'Sports',
    //     'Weather',
    //     'Business & Finance',
    //     'Disaster & Accident',
    //     'Entertainment & Arts',
    //     'Law & Government',
    //     'Science & Technology',
    //   ],
    //   datasets: [{
    //     data: [
    //       categories.crimeCount.reduce((a, b) => (a + b), 0),
    //       categories.cultureCount.reduce((a, b) => (a + b), 0),
    //       categories.econCount.reduce((a, b) => (a + b), 0),
    //       categories.envCount.reduce((a, b) => (a + b), 0),
    //       categories.healthCount.reduce((a, b) => (a + b), 0),
    //       categories.lifeCount.reduce((a, b) => (a + b), 0),
    //       categories.polCount.reduce((a, b) => (a + b), 0),
    //       categories.sportsCount.reduce((a, b) => (a + b), 0),
    //       categories.weatherCount.reduce((a, b) => (a + b), 0),
    //       categories.busFinCount.reduce((a, b) => (a + b), 0),
    //       categories.disAccCount.reduce((a, b) => (a + b), 0),
    //       categories.entArtCount.reduce((a, b) => (a + b), 0),
    //       categories.lawGovCount.reduce((a, b) => (a + b), 0),
    //       categories.sciTechCount.reduce((a, b) => (a + b), 0),
    //     ],
    //     backgroundColor: [
    //       '#EA5F48',
    //       '#29C7CA',
    //       '#AE12FF',
    //       '#79FF3B',
    //       '#FF3F35',
    //       '#FFFD00',
    //       '#247DE8',
    //       '#873C0D',
    //       '#FF2B8A',
    //       '#FF7218',
    //       '#6A7D8F',
    //       '#06FF00',
    //       '#E86990',
    //       '#715F7F',
    //       '#287F00',
    //     ],
    //   }],
    // };
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
      <Grid>
        <Grid.Row>
          <Grid.Column width={7}>
            <Grid.Column>
              <Segment>
                <Label attached="top right">Verified Sources Count</Label>
                <Line data={verifiedSourcesLineData} />
              </Segment>
              <Segment>
                <Label attached="top right">Pending Sources</Label>
                <Bar data={pendingSourcesBarData} />
              </Segment>
            </Grid.Column>

            <Segment>
              <Label attached="top right">Sentiments</Label>
              {/* <Line data={sentimentLineData} /> */}
              <Pie data={sentimentPieData} />
            </Segment>
          </Grid.Column>

          <Grid.Column width={9}>
            <Statistics
              visitors={counts.visitors}
              articles={counts.articles}
              pendingSources={counts.pendingSources}
              legitimateSources={counts.legitimateSources}
              illegitimateSources={counts.illegitimateSources}
            />
            <Segment>
              <Label attached="top right">Articles</Label>
              <HorizontalBar data={categoriesBarData} />
            </Segment>
            <Segment>
              <Label attached="top right">Articles</Label>
              <Line data={categoriesLineData} />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            <Grid columns={3}>
              <Grid.Column>
                <Segment>
                  <Label attached="top right">Top 10 People</Label>
                  <HorizontalBar data={peopleBarData} />
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment>
                  <Label attached="top right">Top 10 Orgs</Label>
                  <HorizontalBar data={orgsBarData} />
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment>
                  <Label attached="top right">Top 10 Locations</Label>
                  <HorizontalBar data={locationsBarData} />
                </Segment>
              </Grid.Column>
            </Grid>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            <Segment style={{ display: 'flex', justifyContent: 'center' }}>
              <Label attached="top right">Word Cloud</Label>
              <WordCloud
                font="lato"
                width={700}
                height={500}
                // padding={(word) => word.value / 10}
                data={wordCloud}
                fontSizeMapper={(word) => Math.log2(word.value) * 5}
                rotate={(word) => word.value % 360}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>

      </Grid>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);

