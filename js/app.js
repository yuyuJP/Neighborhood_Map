//Location list
var locations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}, id: 0},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}, id: 1},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}, id: 2},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}, id: 3},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}, id: 4},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}, id: 5}
];

//Map
var map;

//Map markers
var markers = [];

var largeInfowindow = null;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  largeInfowindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      animation: google.maps.Animation.DROP
    });

    // Push the marker to our array of markers.
    markers.push(marker);

    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  }

}

// ViewModel
var viewModel = function() {
  var self = this;

  this.filterInput = ko.observable('');

  // Filter locations to display on list
  this.filterLocations = ko.computed(function() {
    var result = [];
    // Search text value
    var searchValue = this.filterInput();
    for (var i = 0; i < locations.length; i++) {
      var isMatch = locations[i].title.toLowerCase().indexOf(searchValue) === -1;
      if (isMatch == false) {
        result.push(locations[i]);
        // Display marker on the map.
        if (markers[i] != null) {
          markers[i].setMap(map);
        }
      } else {
        // Remove marker on the map.
        if (markers[i] != null) {
          markers[i].setMap(null);
        }
      }
    }

    return result;

  }, this);

  // Display info window when list item is clicked.
  this.didSelect = function(selectedLocation) {
    populateInfoWindow(markers[selectedLocation.id], largeInfowindow);
  };
};

// Call knockout apply bindings.
ko.applyBindings(new viewModel());


function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' +'<div>No Street View Found</div>');
        }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
}
