import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';
import Places from 'google-maps-react';
import ReactDOM from 'react-dom';

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
                activeMarker: null,
            });
        }
    }
    render() {

        return (
            <div>
            <CurrentLocation centerAroundCurrentLocation google={this.props.google}>
            </CurrentLocation>
            </div>
        );
    }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDfaCamdV4CSw1jBTG8NZeem0YG6kguM3s'
})(MapContainer);
