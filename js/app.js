//Location list
var locations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

//Location
var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
}

// ViewModel
var viewModel = function() {
  var self = this;
  this.locationList = ko.observableArray([]);
  locations.forEach(function(loc){
    self.locationList.push(new Location(loc));
  });

  this.currentLocation = ko.observable(this.locationList()[0]);

  this.didSelect = function(selectedLocation) {
    self.currentLocation(selectedLocation);
    //console.log(self.currentLocation().title());
  };
};

ko.applyBindings(new viewModel());

//Map UI
var map;

//Map markers
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var largeInfowindow = new google.maps.InfoWindow();

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

//Filter callback function
$.mobile.filterable.prototype.options.filterCallback = function( index, searchValue ) {
  //Fetch list item
  var filtertext = $.mobile.getAttribute(this, 'filtertext');
  filtertext = (filtertext == null ? '' : filtertext);
  //Concatinate displaying text
  var filtertext_con = filtertext + ' ' + $.trim($(this).text());
  //Search items in lower case
  var result = filtertext_con.toLowerCase().indexOf(searchValue) === -1
  if (result == false) {
    //Display marker on the map.
    if (markers[index] != null) {
      markers[index].setMap(map);
    }

  } else {
    //Hide marker on the map.
    if (markers[index] != null) {
      markers[index].setMap(null);
    }
  }

  return result;
};
