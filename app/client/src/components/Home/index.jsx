import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import NewsMenu from '../NewsMenu';

const mapStyle = [
	{
		"featureType": "all",
		"elementType": "all",
		"stylers": [
				{
						"invert_lightness": true
				},
				{
						"saturation": 20
				},
				{
						"lightness": 50
				},
				{
						"gamma": 0.4
				},
				{
						"hue": "#00ffee"
				}
		]
	},
	{
		"featureType": "all",
		"elementType": "geometry",
		"stylers": [
				{
						"visibility": "simplified"
				}
		]
	},
	{
		"featureType": "all",
		"elementType": "labels",
		"stylers": [
				{
						"visibility": "on"
				}
		]
	},
	{
		"featureType": "administrative",
		"elementType": "all",
		"stylers": [
				{
						"color": "#ffffff"
				},
				{
						"visibility": "simplified"
				}
		]
	},
	{
		"featureType": "administrative.land_parcel",
		"elementType": "geometry.stroke",
		"stylers": [
				{
						"visibility": "simplified"
				}
		]
	},
	{
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [
				{
						"color": "#405769"
				}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [
			{
					"color": "#232f3a"
			}
		]
	}
]

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
				styles: mapStyle,
				gestureHandling: 'greedy'
			}}
		>
		</GoogleMapReact>
		<NewsMenu />
		</div>
    );
  }
}

export default Home;
