import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Button, Modal, Header, Label, Grid, Segment, Icon } from 'semantic-ui-react';
import { HorizontalBar, Bar, Line, Pie } from 'react-chartjs-2';
import WordCloud from 'react-d3-cloud';
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
    fetchStatus,
    isModalOpen,
  },
  mapArticles: {
    articles,
  },
}) => ({
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
  state = {
    activeCard: 'mainMenu',
    labelDesc: 'Insights',
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
      ids,
    } = this.props;

    switch (this.state.activeCard) {
      case 'Sentiments':
        return (
          <SentimentCharts
            sentiment={sentiment}
            fetchSentimentInsights={() => this.props.fetchSentimentInsights(ids)}
          />
        );
      case 'Categories':
        return (
          <CategoriesCharts
            categories={categories}
            fetchCategoriesInsights={() => this.props.fetchCategoriesInsights(ids)}
          />
        );
      case 'WordCloud':
        return (
          <InsightWordCloud
            wordCloud={topKeywords.map(({ keyword, count }) => ({
              text: keyword,
              value: count,
            }))}
            fetchWordCloud={(count = 200) => this.props.fetchTopInsights(ids, 'keywords', count)}
          />
        );
      case 'Top Ten':
        return (
          <TopTen
            topPeople={topPeople}
            topOrgs={topOrgs}
            topLocations={topLocations}
            fetchTopInsights={(field, count = 10) => this.props.fetchTopInsights(ids, field, count)}
          />
        );
      case 'mainMenu':
        return (
          <div>
            <Grid>
              <Grid.Row columns={2}>
                <Grid.Column>
                  {this.renderSegment(
                    'smile',
                    'Sentiments',
                    'This is supposed to be a long description but I made it short',
                  )}
                </Grid.Column>
                <Grid.Column>
                  {this.renderSegment(
                    'tags',
                    'Categories',
                    'This is supposed to be a long description but I made it short',
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns={2}>
                <Grid.Column>
                  {this.renderSegment(
                    'cloud',
                    'WordCloud',
                    'This is supposed to be a long description but I made it short',
                  )}
                </Grid.Column>
                <Grid.Column>
                  {this.renderSegment(
                    'ordered list',
                    'Top Ten',
                    'This is supposed to be a long description but I made it short',
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
    const { activeCard, labelDesc } = this.state;
    const { isModalOpen } = this.props;

    return (
      <div>
        <Button
          content="Insights"
          icon="bar chart"
          labelPosition="left"
          onClick={this.props.openModal}
        />
        <Modal
          open={isModalOpen}
          onClose={() => {
            this.props.closeModal();
            this.setState({ activeCard: 'mainMenu' });
          }}
          closeOnDimmerClick
        >
          <Label as="a" color="teal" size="huge" ribbon>{labelDesc}</Label>
          <Button
            as="a"
            icon={activeCard === 'mainMenu' ? 'close' : 'long arrow left'}
            floated="right"
            color="red"
            basic
            content={activeCard === 'mainMenu' ? 'CLOSE' : 'BACK'}
            onClick={() => (activeCard === 'mainMenu'
              ? this.props.closeModal()
              : this.setState({ activeCard: 'mainMenu', labelDesc: 'Insights' }))
            }
          />
          <Modal.Content scrolling>
            {this.renderCharts()}
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);
