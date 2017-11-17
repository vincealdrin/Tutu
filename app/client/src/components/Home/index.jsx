import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

class Home extends Component {
  defaultCenter = {
	  lat: 14.60,
	  lng: 120.98
  }
  render() {
    return (
		<div style={{ width: '100vw', height: '100vh' }}>
		<GoogleMapReact
			defaultCenter={this.defaultCenter}
			defaultZoom={9}
			bootstrapURLKeys={{
				key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds'
			}}
			options={{
				minZoom: 9,
				maxZoom: 21,
				gestureHandling: 'greedy'
			}}
		>
		</GoogleMapReact>
		</div>
    );
  }
}

export default Home;
