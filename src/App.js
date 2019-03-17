import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// import {GoogleApiComponent} from 'google-maps-react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';
import Places from 'google-maps-react';


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











// ha what is going on??



class App extends Component {

    constructor(props) {
        super(props)
        this.state = {username: '', password: ''}

        this.handleChangePW = this.handleChange.bind(this);
        this.handleChangeUS = this.handleChange.bind(this);

        this.submitChange = this.handleSubmit.bind(this);
    }

    handleChangeUS(event) {
        this.setState({username: event.target.username})
    }

    handleChangePW(event) {
        this.setState({password: event.target.password})
    }


  render() {
    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Username: <input type="text" name="username"/>
          <br/>
            Password: <input type="text" name="password"/>

          </p>

          <input type="submit" value="Submit" />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

// App.defaultProps = {
//     username="username",
//     password="password"
// }
// export default App
