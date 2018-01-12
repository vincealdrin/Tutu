import React, { Component } from 'react';
import { Segment, Label, Menu, List } from 'semantic-ui-react';
import SourcesCarousel from './SourcesCarousel';

class Sources extends Component {
	state = { activeItem: 'reliable' };
	
	changeItem = (_, { name }) => this.setState({ activeItem: name });
	mockReliable = [
		'Inquirer',
		'Rappler',
		'Philippine Star',
		'CNN Philippines',
		'GMA News Online',
		'ABS-CBN News',
		'The Manila Times',
		'Manila Bulletin',
		'Philippine Times',
		'Business Mirror',
		'Business World Online',
		'Inquirer',
		'Rappler',
		'Philippine Star',
		'CNN Philippines',
		'GMA News Online',
		'ABS-CBN News',
		'The Manila Times',
		'Manila Bulletin',
		'Philippine Times',
		'Business Mirror',
		'Business World Online',
	]
	render() {
		const { activeItem } = this.state;
		return (
			<div>
        <Segment>
					<Label as="a" color="teal" ribbon style={{ marginBottom: '1rem' }}>Sources</Label>
					<Menu pointing secondary>
						<Menu.Item name="reliable" active={activeItem === 'reliable'} onClick={this.changeItem} />
						<Menu.Item name="unreliable" active={activeItem === 'unreliable'} onClick={this.changeItem} />
					</Menu>
          <div className="scrollable-section">
						{/* <List ordered>
							{this.mockReliable.map((reliable) => (
								<List.Item>
									{reliable}
								</List.Item>
							))}
						</List> */}
						<SourcesCarousel content={this.mockReliable} />
					</div>
        </Segment>
      </div>
		)
	}
}

export default Sources;
