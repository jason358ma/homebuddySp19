import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// import {GoogleApiComponent} from 'google-maps-react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { InfoWindow, Marker } from 'google-maps-react';

import ReactDOM from 'react-dom';
// import * as ReactDOM from 'react-dom'

export class MapContainer extends Component {

    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {}
    };

    onMarkerClick = (props, marker, e) =>
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });

    onClose = props => {
        if (this.state.showingInfoWindow === true) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            });
        }
    }

    render() {
        const styles = {
          width: '100%',
          height: '100%'
        };
        return (
            <Map
                google={this.props.google}
                style={styles}
                zoom = {14}
                initialCenter={{
                    lat: 37.871295,
                    lng: -122.260314
                }}
            >
                <Marker
                onClick={this.onMarkerClick}
                name={'UC Berkeley'}
                />
                <InfoWindow
                  marker={this.state.activeMarker}
                  visible={this.state.showingInfoWindow}
                  onClose={this.onClose}
                >
                    <div>
                        <h2>{this.state.selectedPlace.name}</h2>
                  </div>
                </InfoWindow>
            </Map>
        );
    }
}

export default GoogleApiWrapper({
  // apiKey: 'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo'
  apiKey: 'AIzaSyBnOC2cYnLyaaYXtnd_IEQWZLkqvg0tqoE'
})(MapContainer);

//
// export class Container extends React.Component {
//   render() {
//     const style = {
//         width: '100vw',
//         height: '100vh'
//     }
//     if (!this.props.loaded) {
//       return <div>Loading...</div>
//     }
//     return (
//         <div style={style}>
//           <Map google={this.props.google}/>
//         </div>
//     )
//   }
// }
//
// export class Map extends React.Component {
//     componentDidUpdate(prevProps, prevState) {
//         if (prevProps.google !== this.props.google) {
//             this.loadMap();
//         }
//     }
//
//     componentDidMount() {
//         this.loadMap();
//     }
//
//     loadMap() { //function called after component rendered
//         if (this.props && this.props.google) { // Google API is available to use
//             const {google} = this.props;
//             const maps = google.maps;
//             const mapRef = this.refs.map;
//             const node = ReactDOM.findDOMNode(mapRef);
//             let zoom = 14;
//             let lat = 37.774929;
//             let lng = -122.419416;
//             const center = new maps.LatLng(lat, lng);
//             const mapConfig = Object.assign({}, {
//                 center: center,
//                 zoom: zoom
//             })
//             this.map = new maps.Map(node, mapConfig);
//             // arguments are DOM node and config. object that creates map
//         }
//     }
//     render() {
//         return (
//             <div ref='map'>
//             </div>
//         )
//     }
// }
