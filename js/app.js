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
  //this.location = ko.observable(data.location);
}

// ViewModel
var viewModel = function() {
  var self = this;
  this.locationList = ko.observableArray([]);
  locations.forEach(function(loc){
    self.locationList.push(new Location(loc));
  });

  //this.currentLocation = ko.observable(this.locationList()[0]);

  this.didSelect = function(selectedLocation) {
    //self.currentLocation(selectedLocation);
  };
};

ko.applyBindings(new viewModel());

//Map UI
var map;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });
  var tribeca = {lat: 40.719526, lng: -74.0089934}
  var marker = new google.maps.Marker({
    position: tribeca,
    map: map,
    title: 'First Marker!'
  });
  var infowindow = new google.maps.InfoWindow({
    content: 'Do you ever feel like an Infowindow, ha?'
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}
