import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Label, Image, Grid, Header } from 'semantic-ui-react';
import MenuItems from './MenuItems';
import './style.css';

class MainMenu extends Component {

  render() {

		const articles = [
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			},
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			},
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			},
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			},
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			},
			{
				source: 'http://www.sunstar.com.ph/sites/default/files/styles/large/public/field/image/article/rappler_1.jpg?itok=6_Elgc2Z',
				description: 'This is a long statement meant to be a description for the image of the article to the left.'
			}
		]

    return (
			<div className="menu-container in-front">
				<div className="left-col">
				<Label as="a" color="red" className="margin-top" ribbon>Top News</Label>
				<div className="news-section">
					<div>
						<Grid>
							{articles.map(article => {
								return (
									<Grid.Row className="articles">
										<Grid.Column width={7}>
											<Image src={article.source} fluid rounded href={article.source} target="_blank" />
										</Grid.Column>
										<Grid.Column width={9}>
											<Header as="h3">Article Name</Header>
											<p>
												{article.description}
											</p>
										</Grid.Column>
									</Grid.Row>
								)
							})}
						</Grid>
					</div>
				</div>
				</div>

				<div className="right-col">
					<MenuItems />
				</div>
			</div>
    );
  }
}

export default MainMenu;
