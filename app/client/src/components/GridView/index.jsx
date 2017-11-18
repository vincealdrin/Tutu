import React, { Component } from 'react';
import { Search } from 'semantic-ui-react';
import NewsMenu from '../NewsMenu';
import News from './News';
import './style.css';

class GridLayout extends Component {

	constructor() {
		super();

		this.state = {
			newsArticlesFirst: [
				{
					newsImage: 'https://images.unsplash.com/photo-1493997575474-58d1db687da3?auto=format&fit=crop&w=750&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Bombing!',
					newsMeta: 'Photo on the Streets of Los Angeles',
					newsDescription: 'This is a card description'
				},
				{
					newsImage: 'https://images.unsplash.com/photo-1508254497628-7074cb3b93ab?auto=format&fit=crop&w=751&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: '"Freedom of Speech"',
					newsMeta: 'A Social Figure Bashed',
					newsDescription: 'This is a card description. This is a long-ass description and it is supposed to be a long card as well. I want to try to make this card longer by spewing nonsense stuff like how I like cake and how I love to not code? Wait, what? Is this... Is this... Madness?'
				}
			],
			newsArticlesSecond: [
				{
					newsImage: 'https://images.unsplash.com/photo-1503814023776-56b4ced5c1ba?auto=format&fit=crop&w=750&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Riot of Boston',
					newsMeta: 'Photo of a Riot in Boston',
					newsDescription: 'This is a card description. This is a long-ass description and it is supposed to be a long card as well. I want to try to make this card longer by spewing nonsense stuff like how I like cake and how I love to not code? Wait, what? Is this... Is this... Madness?'
				},
				{
					newsImage: 'https://images.unsplash.com/photo-1498644035638-2c3357894b10?auto=format&fit=crop&w=334&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Mile High',
					newsMeta: 'Price hike on paper?!',
					newsDescription: 'This is a card description'
				}
			],
			newsArticlesThird: [
				{
					newsImage: 'https://images.unsplash.com/photo-1485056981035-7a565c03c6aa?auto=format&fit=crop&w=752&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'The Force',
					newsMeta: 'Police Force Preparing for Rallyists',
					newsDescription: 'This is a card description'
				},
				{
					newsImage: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&w=334&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Cycling in Bliss',
					newsMeta: 'Relaxing cycling spots in the Philippines',
					newsDescription: 'This is a description for the meta above'
				}
			],
			newsArticlesFourth: [
				{
					newsImage: 'https://images.unsplash.com/photo-1500398925958-b224455d0828?auto=format&fit=crop&w=334&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Abandoned Asylum',
					newsMeta: 'A Photo inside an Abandoned Asylum on a New York Island',
					newsDescription: 'This is a card description'
				},
				{
					newsImage: 'https://images.unsplash.com/photo-1440151050977-247552660a3b?auto=format&fit=crop&w=939&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D',
					newsHeader: 'Paradise on Earth',
					newsMeta: 'The Best Resorts in the Philippines',
					newsDescription: 'This is a description about the best resorts in the Philippines'
				}
			]
		}
	}

  render() {
		
    return (
			<div>
				<div className='UpperBleed'>
					<Search placeholder='Search News...' className='SearchBar' />
				</div>
				<NewsMenu />
				<News
					newsFirst={this.state.newsArticlesFirst} 
					newsSecond={this.state.newsArticlesSecond}
					newsThird={this.state.newsArticlesThird}
					newsFourth={this.state.newsArticlesFourth} 
				/>
			</div>
    );
  }
}

export default GridLayout;
