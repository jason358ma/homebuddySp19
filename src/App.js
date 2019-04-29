import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import MapContainer from './MapContainer.js'

// import {GoogleApiComponent} from 'google-maps-react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';
import Places from 'google-maps-react';
import axios from 'axios';

import ReactDOM from 'react-dom';
// import * as ReactDOM from 'react-dom'

class Signup extends Component {

    constructor(props) {
      super(props);
      this.state = {
        username: 'u',
        password: 'p',
        first: 'f',
        last: 'l',
        loginSuccess: false
      };

      this.handleChange = this.handleChange.bind(this);
      this.submitClicked= this.submitClicked.bind(this);
    }

    handleChange(event) {
        switch (event.target.id) {
            case "username":
                this.setState({username: event.target.value});
                break;
            case "password":
                this.setState({password: event.target.value});
                break;
            case "first":
                this.setState({first: event.target.value});
                break;
            case "last":
                this.setState({last: event.target.value});
        }
        console.log(event.target.id)
    }

    submitClicked = () => {
        alert('submit clicked!')
        console.log(this.state)

        axios.post("/signup", {
            email: this.state.username,
            password: this.state.password,
            firstName: this.state.first,
            lastName: this.state.last
        }).then(response => {
            console.log(response.data);
        })
    }

    loginClicked = () => {
      this.setState({loginSuccess : true})
      this.forceUpdate();
      axios.post("/signin", {
          email: this.state.username,
          password: this.state.password,
      }).then(response => {
          console.log(response.data);
          if (response.data === true) { //if response is successful
            alert('Logging in!')
            this.setState({loginSuccess : true})
          } else {
            alert('Login Unsuccessful')
            this.setState({loginSuccess : false})
          }
        })
    }

  render() {
    console.log(this.state.loginSuccess);
    if (this.state.loginSuccess === true) {
      return (
        <MapContainer/>
      );
    } else {
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

            <label> First:
            <input type="text" id="first" first={this.state.first} onChange={this.handleChange} />
          </label>

          <label> Last:
          <input type="text" id="last" last={this.state.last} onChange={this.handleChange} />
        </label>
            <br/>
            <input type="submit" username="Submit" onClick={this.submitClicked}/>
            <button username="login" id="loginbutton" onClick={this.loginClicked}>LOGIN</button>
          </header>
        </div>
      );
    }
  }
}

Signup.defaultProps = {
    value: '',
    username: "username",
    password: "password"
}
export default Signup
