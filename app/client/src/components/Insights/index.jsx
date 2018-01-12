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
import { getLineDataset } from '../../utils';
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
	state = {
		activeCard: 'mainMenu',
		labelDesc: 'Insights'
	};

  render() {
		const { activeCard, labelDesc } = this.state;
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
          onClose={() => {
						this.props.closeModal;
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
						onClick={() => {activeCard === 'mainMenu'
							? (
								this.props.closeModal()
							)
							: (
								this.setState({ activeCard: 'mainMenu', labelDesc: 'Insights' })
							)
						}}
						/>
          <Modal.Content scrolling>
						<InsightMenu
							theState={this}
							labelDesc={labelDesc}
							activeCard={activeCard}
							sentiment={sentiment}
							categories={categories}
							wordCloud={topKeywords}
							topPeople={topPeople}
							topLocations={topLocations}
							topOrgs={topOrgs}
						/>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

const InsightMenuItemSegments = ({
	icon,
	header,
	desc,
	theState
}) => (
	<Segment
		raised
		textAlign="center"
		className="insight-menu-item"
		onClick={() => theState.setState({
			activeCard: header,
			labelDesc: header
		})}
	>
		<Icon name={icon} color="grey" size="big" />
		<Header className="insight-menu-name">{header}</Header>
		<p>{desc}</p>
	</Segment>
)

const InsightMenu = ({
	theState,
	labelDesc,
	activeCard,
	sentiment,
	categories,
	wordCloud,
	topPeople,
	topLocations,
	topOrgs
}) => {
	let insightMenuItem;
	switch (activeCard) {
		case 'Sentiments' : {
			insightMenuItem = <SentimentCharts sentiment={sentiment} />
			break;
		}
		case 'Categories' : {
			insightMenuItem = <CategoriesCharts categories={categories} />
			break;
		}
		case 'WordCloud' : {
			insightMenuItem = <InsightWordCloud wordCloud={wordCloud} />
			break;
		}
		case 'Top Ten' : {
			insightMenuItem = <TopTen
				topPeople={topPeople}
				topOrgs={topOrgs}
				topLocations={topLocations}
			/>
			break;
		}
		case 'mainMenu' : {
			insightMenuItem = (<div>
				<Grid>
					<Grid.Row columns={2}>
					<Grid.Column>
						<InsightMenuItemSegments
							icon="smile"
							header="Sentiments"
							desc="This is supposed to be a long description but I made it short"
							theState={theState}
						/>
					</Grid.Column>
					<Grid.Column>
						<InsightMenuItemSegments
							icon="tags"
							header="Categories"
							desc="This is supposed to be a long description but I made it short"
							theState={theState}
						/>
					</Grid.Column>
					</Grid.Row>
					<Grid.Row columns={2}>
						<Grid.Column>
							<InsightMenuItemSegments
							icon="cloud"
							header="WordCloud"
							desc="This is supposed to be a long description but I made it short"
							theState={theState}
						/>
						</Grid.Column>
						<Grid.Column>
							<InsightMenuItemSegments
							icon="ordered list"
							header="Top Ten"
							desc="This is supposed to be a long description but I made it short"
							theState={theState}
						/>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</div>)
		}
		default: {
			<p>NONE</p>
		}
	}
	return insightMenuItem;
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Insights);
