import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// import {GoogleApiComponent} from 'google-maps-react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';


import ReactDOM from 'react-dom';
// import * as ReactDOM from 'react-dom'

export class MapContainer extends Component {

    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {}
    };

    onMarkerClick = (props, marker, m2, e) =>
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
        const styles = {
          width: '100%',
          height: '100%'
        };
        return (
            // <Map
            //     google={this.props.google}
            //     style={styles}
            //     zoom = {14}
            //     // initialCenter={{
            //     //     lat: 37.871295,
            //     //     lng: -122.260314
            //     // }}
            // >

            <CurrentLocation centerAroundCurrentLocation google={this.props.google}>
                <Marker
                onClick={this.onMarkerClick}
                name={'current location'}
                />

                <Marker
                // onClick={this.onMarkerClick}
                // name={'Test Marker'}
                // position={{
                //     lat: 37.875,
                //     lng: -122.260314
                // }}
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

            </CurrentLocation>

            // </Map>
        );
    }
}

export default GoogleApiWrapper({
  // apiKey: 'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo'
  apiKey: 'AIzaSyDfaCamdV4CSw1jBTG8NZeem0YG6kguM3s'
})(MapContainer);
