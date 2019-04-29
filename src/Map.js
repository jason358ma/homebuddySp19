// pacinputimport React from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';


const mapStyles = {
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: '0px',
        top: '0px'
    }
};

const searchboxStyles = {
    searchbox: {
        'background-color': '#ffffff',
        position: 'absolute',
        width: '8%',
        height: '8%',
        left: '0px',
        top: '0px'
    }
    // searchbox: {
    //       background-color: '#fff';
    //       fontFamily: 'Roboto';
    //       fontSize: '15px';
    //       fontWeight: '300';
    //       marginLeft: '12px';
    //       padding: '0 11px 0 13px';
    //     //   textOverflow: 'ellipsis';
    //       position: 'absolute',
    //       width: '30%'
    //       top: '0px';
    //       left: '0px'
    //   }
};

const buttonStyles = {
    button: {
        position: 'absolute',
        zIndex: 1,
        width: '8%',
        height: '8%',
    }
    // searchbox: {
    //       background-color: '#fff';
    //       fontFamily: 'Roboto';
    //       fontSize: '15px';
    //       fontWeight: '300';
    //       marginLeft: '12px';
    //       padding: '0 11px 0 13px';
    //     //   textOverflow: 'ellipsis';
    //       position: 'absolute',
    //       width: '30%'
    //       top: '0px';
    //       left: '0px'
    //   }
};

class searchBox extends React.Component {
    constructor(props) {

    }
}

export class Map extends React.Component {
  constructor(props) {
    super(props);

    const { lat, lng } = this.props.initialCenter;

    const directionsService = new this.props.google.maps.DirectionsService();
    const directionsDisplay = new this.props.google.maps.DirectionsRenderer();
    // const searchBox = new this.props.google.maps.places.SearchBox();
    var searchBox = new this.props.google.maps.places.SearchBox(document.getElementById('pac-input'));
    // var pairButton = React.createClass({
    //   render : function() {
    //     return (
    //       <button
    //         onClick={this.getBuddy}>Pair Buddy</button>
    //     );
    //   }
    // });

    this.state = {
      currentLocation: {
        lat: lat,
        lng: lng
      },
      destination: {
          lat: 37.868112,
          lng: -122.255033
      },
      waypoints: [],
      directionsService : directionsService,
      directionsDisplay : directionsDisplay,
      searchBox : searchBox,
    };
  }

  componentDidMount() {
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude
            }
          });
          this.loadMap()
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }
  }

  getBuddy = () => {
    axios.post("/findBuddy", {
    }).then(response => {
        console.log("buddy name: " + response.data);
    })
  }

  pushWaypoint = (latitude, longitude) => {
    this.state.waypoints.push({
      location: {
        lat: latitude,
        lng: longitude
      },
      stopover: true
    })
    //console.log(this.state)
  }

  loadMap = () => {
    if (this.props && this.props.google) {
      // checks if google is available
      const { google } = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;

      // reference to the actual DOM element
      const node = ReactDOM.findDOMNode(mapRef);

      let { zoom } = this.props;
      let { lat, lng } = this.state.currentLocation;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = Object.assign(
        {},
        {
          center: center,
          zoom: zoom
        }
      );
      // maps.Map() is constructor that instantiates the map
      this.map = new maps.Map(node, mapConfig);
      this.state.directionsDisplay.setMap(this.map);

    //   let destination = { //unit 1
    //     lat: 37.868112,
    //     lng: -122.255033
    //   }
    //   this.displayRoute(destination);

      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input)
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      var markers = [];

      searchBox.addListener('places_changed', () => {
          var places = searchBox.getPlaces();
          if (places.length == 0) {
              return;
          }
          markers.forEach(function(marker) {
              marker.setMap(null);
          });
          markers = [];
        //   for each new place, get icon name and location
        //   var bounds = google.LatLngBounds();
          places.forEach((place) => {
              if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
              }
              var icon = {
                  url: place.icon,
                  size: google.maps.Size(71, 71),
                  origin: google.maps.Point(0, 0),
                  anchor: google.maps.Point(17, 34),
                  scaledSize: google.maps.Size(25, 25)
              }
            //   Create a marker for each place.
              markers.push(new google.maps.Marker({
                  map: this,
                //   i called this.map earlier didnt work
                  icon: icon,
                  title: place.name,
                  position: place.geometry.location
              }));
            //   console.log(place.geometry.location.lat())
            //   console.log(place.geometry.location.lng())
            //   destination = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}

              var getLatLng = new Promise(function(resolve, reject) {
                  var lat = place.geometry.location.lat()
                  var lng = place.geometry.location.lng()
                  var dest = {lat, lng}
                  resolve(dest)
              })

              var getLatLngCallback = (value) => {
                  console.log("value:")
                  console.log(value)
                  console.log(this.state)
                  console.log("state")
                  this.setState((state) => {
                      return {destination: value}
                  }, () => {
                      console.log("STATE")
                      console.log(this.state)

                      axios.post("/coordinates", {
                          startLat: this.state.currentLocation.lat,
                          startLong: this.state.currentLocation.lng,
                          destLat: this.state.destination.lat,
                          destLong: this.state.destination.lng,
                      }).then(response => {
                          console.log(response.data);
                      })
                      this.pushWaypoint(37.4275, -122.1697) //stanford
                      this.loadMap()
                  });
              }

              getLatLng.then((value) => {
                //   console.log("value:")
                //   console.log(value)
                //   console.log(this.state)
                //   console.log("state")
                //   this.setState((state) => {
                //       return {destination: value}
                //   }, () => {
                //       console.log(this.state.destination)
                //       this.loadMap()
                //   });
                getLatLngCallback(value)
              })

            //   if (place.geometry.viewport) {
            //       // Only geocodes have viewport.
            //       bounds.union(place.geometry.viewport);
            //     } else {
            //       bounds.extend(place.geometry.location);
            //     }
          })
        //   this.map.fitBounds(bounds)

    });
      console.log(this.state)
      this.displayRoute(this.state.destination)
    //  need to call displayRoute here
    }
}


displayRoute(destination) { //display route from current location to specified destination
    this.state.directionsService.route({
        origin: new this.props.google.maps.LatLng(this.state.currentLocation.lat, this.state.currentLocation.lng),
        destination: new this.props.google.maps.LatLng(destination.lat, destination.lng),
        waypoints: this.state.waypoints,
        travelMode: this.props.google.maps.TravelMode['WALKING']
        }, (response, status) => {
            if (status === 'OK') {
                console.log(this.state.currentLocation);
                this.state.directionsDisplay.setDirections(response);

            } else {
                window.alert('Directions request failed due to: ' + status);
            }
        })
  }


  recenterMap() {
    const map = this.map;
    const current = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;

    if (map) {
      let center = new maps.LatLng(current.lat, current.lng);
      map.panTo(center);
    }
  }


  renderChildren() {
    const { children } = this.props;
    console.log("children: " + children);

    if (!children) return;

    return React.Children.map(children, c => {
      if (!c) return;
      return React.cloneElement(c, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.state.currentLocation
      });
    });
  }

  render() {
    // console.log(this.props);
    const style = Object.assign({}, mapStyles.map);
    const stylesearchbar = Object.assign({}, searchboxStyles.searchbox);
    const stylebutton = Object.assign({}, buttonStyles.button);

    return (
      <div>
          <div style={stylesearchbar}>
            <input id="pac-input" class="controls" type="text" placeholder="Search box"/>
          </div>
          <div style={stylebutton}>
              <button id="search-button" onClick={this.getBuddy}>Find Buddy!</button>
          </div>
        <div id="map" style={style} ref="map">
          Loading map...
        </div>
      </div>
    );
    this.renderChildren()
  }
}

export default Map;


Map.defaultProps = {
  zoom: 14,
  initialCenter: {
    lat: 37.871295,
    lng: -122.260314
  },
  centerAroundCurrentLocation: true,
  visible: true
};
