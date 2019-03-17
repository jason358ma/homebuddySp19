import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'


const mapStyles = {
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
};

const searchboxStyles = {
    position: 'absolute',
    width: '30%'
}

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


    this.state = {
      currentLocation: {
        lat: lat,
        lng: lng
      },
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

  loadMap() {
    if (this.props && this.props.google) {
      // checks if google is available
      const { google } = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;

      // reference to the actual DOM element
      const node = ReactDOM.findDOMNode(mapRef);

      let { zoom } = this.props;
      let { lat, lng } = this.state.currentLocation;
    //   console.log(lat, lng);
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
      let destination = { //unit 1
        lat: 37.868112,
        lng: -122.255033
      }
      this.displayRoute(destination);


      var input = document.getElementById('pac-input');
      var searchBox = google.maps.places.SearchBox(input)
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      var markers = [];
    //   searchBox.addListener('places_changed', function() {
    //       var places = searchBox.getPlaces();
    //       if (places.length == 0) {
    //           return;
    //       }
    //       markers.forEach(function(marker) {
    //           marker.setMap(null);
    //       });
    //       markers = [];
    //       var bounds = google.LatLngBounds();
    //       places.forEach(function(place) {
    //           if (!place.geometry) {
    //             console.log("Returned place contains no geometry");
    //             return;
    //           }
    //           var icon = {
    //               url: place.icon,
    //               size: google.maps.Size(71, 71),
    //               origin: google.maps.Point(0, 0),
    //               anchor: google.maps.Point(17, 34),
    //               scaledSize: google.maps.Size(25, 25)
    //           }
    //       })
      //
    //   });
    }
  }

  displayRoute(destination) { //display route from current location to specified destination\
    this.state.directionsService.route({
        origin: new this.props.google.maps.LatLng(this.state.currentLocation.lat, this.state.currentLocation.lng),
        destination: new this.props.google.maps.LatLng(destination.lat, destination.lng),
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

    return (
      <div>
          <div>
            <input id="pac-input" class="controls" type="text" placeholder="Search Box"/>
          </div>

        <div style={style} ref="map">
          Loading map...
        </div>
        {this.renderChildren()}
      </div>
    );
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
