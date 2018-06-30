//Location list
var locations = [
  {title: 'Tokyo Tower', location: {lat: 35.658581, lng: 139.745438}, id: 0},
  {title: 'Tokyo Skytree', location: {lat: 35.710064, lng: 139.810699}, id: 1},
  {title: 'Sensō-ji', location: {lat: 35.7088471646, lng: 139.791386834}, id: 2},
  {title: 'Tokyo Disneyland', location: {lat: 35.626330828, lng: 139.8749965}, id: 3},
  {title: 'Odaiba', location: {lat: 35.624792, lng: 139.77671}, id: 4},
  {title: 'Tokyo Imperial Palace', location: {lat: 35.685360, lng: 139.753372}, id: 5}
];

//Map
var map;

//Map markers
var markers = [];

var largeInfowindow = null;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.658581, lng: 139.745438},
    zoom: 11
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

mapError = function mapError() {
  alert('Unable to load Google Maps. Try again!')
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
      var isMatch = locations[i].title.toLowerCase().indexOf(searchValue.toLowerCase()) === -1;
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

    // Wiki url to call API
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&limit=1&namespace=0&format=json'

    // Time out method to handle errors
    var wikiRequestTimeout = setTimeout(function() {
      infowindow.setContent('<div>Faied to get wikipedia resources</div>');
    }, 8000);

    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      success: function(response) {
        var articleList = response[1];
        // When NO infomation is found on wikipedia
        if (articleList[0] == null) {
          infowindow.setContent('<div>No infomation on Wikipedia</div>');
          // Clear timeout
          clearTimeout(wikiRequestTimeout);
        // When infomation is found on wikipedia
        } else {
          var url = 'http://en.wikipedia.org/wiki/' + articleList[0];
          var content = '<div class="wiki-container"><div>Wikipedia Top Result</div>' + '<div><a href="' + url + '">' + response[2] +  '</a></div></div>'
          infowindow.setContent(content);
          // Clear timeout
          clearTimeout(wikiRequestTimeout);
        }

      }
    });

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);

    //Bounce marker when clicked.
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    //Stop animation after 1sec.
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1000);
  }
}
