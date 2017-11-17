import React, { Component } from 'react';
import { Grid, Search } from 'semantic-ui-react';
import NewsMenu from '../NewsMenu';
import './style.css';

class GridLayout extends Component {
  render() {
    return (
		<div className='GridLayoutView'>
			<section className='BleedColor'>
				<Grid style={{ display: 'flex' }}>
					<Grid.Column width={8}>
						<Search className='SearchBar' fluid />
					</Grid.Column>
					<Grid.Column width={4}>
						<NewsMenu />
					</Grid.Column>
				</Grid>
			</section>
		</div>
    );
  }
}

export default GridLayout;
