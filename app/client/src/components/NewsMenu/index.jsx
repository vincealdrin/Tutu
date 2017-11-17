import React, { Component } from 'react';
import { Card, Header } from 'semantic-ui-react';
import './style.css';

class NewsMenu extends Component {
	render() {
		return (
			<div className='NewsMenu'>
				<Card fluid>
					<section className='Bleed'>
						<Header as='h3' style={{ color: '#fff' }}>This is the Bleed Part</Header>
					</section>
					<Card.Content>

					</Card.Content>
				</Card>
			</div>
		)
	}
}

export default NewsMenu;