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

// export default GoogleApiWrapper({
//   apiKey: 'AIzaSyDfaCamdV4CSw1jBTG8NZeem0YG6kguM3s'
// })(MapContainer);











// ha what is going on??



class Signup extends Component {

    constructor(props) {
      super(props);
      this.state = {username: 'u', password: 'p'};

      this.handleChange = this.handleChange.bind(this);
      this.submitClicked= this.submitClicked.bind(this);
    }

    handleChange(event) {
        if (event.target.id === "password") {
            this.setState({password: event.target.value});
        } else {
            this.setState({username: event.target.value});
        }
        console.log(event.target.id)
    }

    submitClicked = () => {
        alert('submit clicked!')
        console.log(this.state)
    }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

            <label> Username:
            <input type="text" id="username" username={this.state.username} onChange={this.handleChange} />
          </label>

          <label> Password:
          <input type="text" id="password" password={this.state.password} onChange={this.handleChange} />
          </label>
          <br/>
          <input type="submit" username="Submit" onClick={this.submitClicked}/>

        </header>
      </div>
    );
  }
}

Signup.defaultProps = {
    value: '',
    username: "username",
    password: "password"
}
export default Signup
