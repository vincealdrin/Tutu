import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Modal, Header, Label, Grid, Segment, Icon } from 'semantic-ui-react';
import {
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
  openModal,
  closeModal,
} from '../../modules/insights';
import SentimentCharts from './SentimentCharts';
import CategoriesCharts from './CategoriesCharts';
import InsightWordCloud from './InsightWordCloud';
import TopTen from './TopTen';
import './styles.css';

const mapStateToProps = ({
  insights: {
    sentiment,
    categories,
    topPeople,
    topOrgs,
    topLocations,
    topKeywords,
    fetchSentimentStatus,
    fetchCategoriesStatus,
    fetchTopPeopleStatus,
    fetchTopOrgsStatus,
    fetchTopLocationsStatus,
    fetchTopKeywordsStatus,
    isModalOpen,
  },
}, { isMap }) => ({
  sentiment,
  categories,
  topPeople,
  topOrgs,
  topLocations,
  topKeywords,
  fetchSentimentStatus,
  fetchCategoriesStatus,
  fetchTopPeopleStatus,
  fetchTopOrgsStatus,
  fetchTopLocationsStatus,
  fetchTopKeywordsStatus,
  isModalOpen,
  isMap,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSentimentInsights,
  fetchTopInsights,
  fetchCategoriesInsights,
  openModal,
  closeModal,
}, dispatch);

class Insights extends Component {
  state = {
    activeCard: 'mainMenu',
    labelDesc: 'Visualized Data',
    isDatalabelShown: true,
  };

  renderSegment = (icon, header, desc) => (
    <Segment
      raised
      textAlign="center"
      className="insight-menu-item"
      onClick={() => this.setState({
        activeCard: header,
        labelDesc: header,
      })}
    >
      <Icon name={icon} color="grey" size="big" />
      <Header className="insight-menu-name">{header}</Header>
      <p>{desc}</p>
    </Segment>
  )

  renderCharts = () => {
    const {
      sentiment,
      categories,
      topKeywords,
      topPeople,
      topOrgs,
      topLocations,
      fetchSentimentStatus,
      fetchCategoriesStatus,
      fetchTopPeopleStatus,
      fetchTopOrgsStatus,
      fetchTopLocationsStatus,
      fetchTopKeywordsStatus,
    } = this.props;
    const { activeCard, isDatalabelShown } = this.state;

    switch (activeCard) {
      case 'Sentiments':
        return (
          <SentimentCharts
            sentiment={sentiment}
            fetchSentimentInsights={this.props.fetchSentimentInsights}
            isDatalabelShown={isDatalabelShown}
            status={fetchSentimentStatus}
          />
        );
      case 'Categories':
        return (
          <CategoriesCharts
            categories={categories}
            fetchCategoriesInsights={this.props.fetchCategoriesInsights}
            isDatalabelShown={isDatalabelShown}
            status={fetchCategoriesStatus}
          />
        );
      case 'WordCloud':
        return (
          <InsightWordCloud
            wordCloud={topKeywords.map(({ keyword, count }) => ({
              text: keyword,
              value: count,
            }))}
            fetchWordCloud={(count = 200) => this.props.fetchTopInsights('keywords', count)}
            status={fetchTopKeywordsStatus}
          />
        );
      case 'Top Ten':
        return (
          <TopTen
            topPeople={topPeople}
            topOrgs={topOrgs}
            topLocations={topLocations}
            fetchTopInsights={(field, count = 10) => this.props.fetchTopInsights(field, count)}
            isDatalabelShown={isDatalabelShown}
            peopleStatus={fetchTopPeopleStatus}
            orgsStatus={fetchTopOrgsStatus}
            locationsStatus={fetchTopLocationsStatus}
          />
        );
      case 'mainMenu':
        return (
          <div>
            <Grid columns={2} stackable>
              <Grid.Column>
                {this.renderSegment(
                  'smile',
                  'Sentiments',
                  'Look at the inclination of people\'s opinions on a certain article either positive, neutral or negative',
                )}
              </Grid.Column>
              <Grid.Column>
                {this.renderSegment(
                  'tags',
                  'Categories',
                  'Look at the total number of articles per category on a specific date.',
                )}
              </Grid.Column>
              <Grid.Row columns={2}>
                <Grid.Column>
                  {this.renderSegment(
                    'cloud',
                    'WordCloud',
                    'Look at the most widely used words. The importance of a word is shown with size or color',
                  )}
                </Grid.Column>
                <Grid.Column>
                  {this.renderSegment(
                    'ordered list',
                    'Top Ten',
                    'Look at the most occuring personalities, organizations and locations.',
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        );
      default:
        return <p>NONE</p>;
    }
  }

  render() {
    const { isModalOpen, isMap } = this.props;
    const { activeCard, labelDesc, isDatalabelShown } = this.state;

    return (
      <Modal
        open={isModalOpen}
        onClose={() => {
            this.props.closeModal();
            this.setState({ activeCard: 'mainMenu' });
          }}
        closeOnDimmerClick
      >
        <Label as="a" color="teal" size="large" ribbon>{labelDesc}</Label>
        <Button
          as="a"
          icon={activeCard === 'mainMenu' ? 'close' : 'long arrow left'}
          floated="right"
          color="white"
          content={activeCard === 'mainMenu' ? 'CLOSE' : 'BACK'}
          onClick={() => (activeCard === 'mainMenu'
            ? this.props.closeModal()
            : this.setState({ activeCard: 'mainMenu', labelDesc: 'Visualized Data' }))
          }
        />
        {isMap ? (
          <Modal.Header style={{ fontSize: '1.1rem', color: '#767676' }}>
            Note: Showed data is contingent on the area of view of the map. (Zoom-in or zoom-out to get more data)
          </Modal.Header>
        ) : null}
        <Modal.Content>
          {this.renderCharts()}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={`${isDatalabelShown ? 'Hide' : 'Show'} Data Labels`}
            color={isDatalabelShown ? 'grey' : 'teal'}
            onClick={() => {
              this.setState({ isDatalabelShown: !isDatalabelShown });
            }}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);
