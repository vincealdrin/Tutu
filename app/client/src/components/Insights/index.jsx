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

const InsightMenuItem = ({
	icon,
	header,
	desc
}) => (
	<Segment raised textAlign="center" className="insight-menu-item">
		<Icon name={icon} color="grey" size="big" />
		<Header className="insight-menu-name">{header}</Header>
		<p>{desc}</p>
	</Segment>
)

const InsightMenu = ({
		closeModal,
		sentiment,
		categories,
		wordCloud,
		topPeople,
		topLocations,
		topOrgs
	}) => (
		<div>
			<Grid>
				<Grid.Row columns={2}>
				<Grid.Column>
					<Modal
						trigger={
							<Segment raised textAlign="center" className="insight-menu-item">
								<Icon name="smile" color="grey" size="big" />
								<Header className="insight-menu-name">Sentiments</Header>
								<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed ex, ullam beatae quo dolore reiciendis nulla ratione earum dolor pariatur quibusdam animi eius!</p>
							</Segment>
					}>
						<Label as="a" color="teal" size="huge" ribbon>Sentiments</Label>
						<Button icon="close" content="CLOSE" floated="right" basic onClick={closeModal} />
						<Modal.Content scrolling>
							<SentimentCharts sentiment={sentiment} />
						</Modal.Content>
					</Modal>
				</Grid.Column>
				<Grid.Column>
					<Modal
						trigger={
							<Segment raised textAlign="center" className="insight-menu-item">
								<Icon name="tags" color="grey" size="big" />
								<Header className="insight-menu-name">Categories</Header>
								<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed ex, ullam beatae quo dolore reiciendis nulla ratione earum dolor pariatur quibusdam animi eius!</p>
							</Segment>
						}>
						<Label as="a" color="teal" size="huge" ribbon>Categories</Label>
						<Button icon="close" content="CLOSE" floated="right" basic onClick={closeModal} />
						<Modal.Content scrolling>
							<CategoriesCharts categories={categories} />
						</Modal.Content>
					</Modal>
				</Grid.Column>
			</Grid.Row>
			<Grid.Row columns={2}>
				<Grid.Column>
					<Modal
						trigger={
							<Segment raised textAlign="center" className="insight-menu-item">
								<Icon name="cloud" color="grey" size="big" />
								<Header className="insight-menu-name">Word Cloud</Header>
								<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed ex, ullam beatae quo dolore reiciendis nulla ratione earum dolor pariatur quibusdam animi eius!</p>
							</Segment>
						}>
							<Label as="a" color="teal" size="huge" ribbon>WordCloud</Label>
							<Button icon="close" content="CLOSE" floated="right" basic onClick={closeModal} />>
							<Modal.Content scrolling>
								<InsightWordCloud wordCloud={wordCloud} />
							</Modal.Content>
						</Modal>
				</Grid.Column>
				<Grid.Column>
					<Modal
						trigger={
							<Segment raised textAlign="center" className="insight-menu-item">
								<Icon name="ordered list" color="grey" size="big" />
								<Header className="insight-menu-name">Top Ten</Header>
								<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed ex, ullam beatae quo dolore reiciendis nulla ratione earum dolor pariatur quibusdam animi eius!</p>
							</Segment>
					}>
						<Label as="a" color="teal" size="huge" ribbon>Top Ten</Label>
						<Button icon="close" content="CLOSE" floated="right" basic onClick={closeModal} />
						<Modal.Content scrolling>
							<TopTen
								topPeople={topPeople}
								topOrgs={topOrgs}
								topLocations={topLocations}
							/>
						</Modal.Content>
					</Modal>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	</div>
	)

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
					style={{
						minHeight: 613.13
					}}
        >
					<Label as="a" color="teal" size="huge" ribbon>Insights</Label>
          <Modal.Content scrolling>
						<InsightMenu
							isModalOpen={isModalOpen}
							isFocused={isFocused}
							sentiment={sentiment}
							categories={categories}
							wordCloud={topKeywords.map(({ keyword, count }) => ({
								text: keyword,
								value: count,
							}))}
							topPeople={topPeople}
							topOrgs={topOrgs}
							topLocations={topLocations}
							closeModal={this.props.closeModal}
						/>
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
