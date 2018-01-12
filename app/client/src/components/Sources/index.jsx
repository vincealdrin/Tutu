import React, { Component } from 'react';
import { Segment, Label, Menu, List } from 'semantic-ui-react';
import SourcesCarousel from './SourcesCarousel';

class Sources extends Component {
	state = { activeItem: 'reliable' };
	
	changeItem = (_, { name }) => this.setState({ activeItem: name });
	mockReliable = [
		[
			'Inquirer',
			'Rappler',
			'Philippine Star',
			'CNN Philippines',
			'GMA News Online',
			'ABS-CBN News',
			'The Manila Times',
			'Manila Bulletin',
			'Philippine Star',
			'CNN Philippines',
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
			'Inquirer',
		],
		[
			'Philippine Star',
			'Inquirer',
			'GMA News Online',
			'Business Mirror',
			'CNN Philippines',
			'Rappler',
			'Manila Bulletin',
			'Philippine Times',
			'ABS-CBN News',
			'Business Mirror',
			'Business World Online',
			'Philippine Star',
			'The Manila Times',
			'Inquirer',
			'CNN Philippines',
			'Rappler',
			'GMA News Online',
			'Philippine Star',
			'Business World Online',
			'ABS-CBN News',
			'CNN Philippines',
			'The Manila Times',
			'Manila Bulletin',
			'Philippine Times',
			'Business Mirror',
		]
	];

	mockUnreliable = [
		[
			'Hot News Philippines',
			'Pinoy World',
			'Duterte Defender',
			'Social News Philippines',
			'Duterte News',
			'Tulfo News',
			'Pinoy News Blogger',
			'Pilipinas Online Updates',
			'Pinoy Sikat',
			'News Titans',
			'Pinoy Tribune'
		],
		[
			'Pinoy World',
			'Duterte Defender',
			'Pinoy Sikat',
			'Social News Philippines',
			'Hot News Philippines',
			'Pinoy Tribune',
			'Pinoy News Blogger',
			'Pilipinas Online Updates',
			'Duterte News',
			'News Titans',
			'Tulfo News'
		]
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
						<SourcesCarousel
							activeItem={activeItem}
							reliableContent={this.mockReliable}
							unreliableContent={this.mockUnreliable}
						/>
					</div>
        </Segment>
      </div>
		)
	}
}

const ActiveMenuItem = ({

}) => {
	let activeMenuItem;

}

export default Sources;
