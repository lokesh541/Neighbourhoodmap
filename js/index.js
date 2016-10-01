var map;
var initialLocations = [{
    title: 'Park Ave Penthouse',
    location: {
        lat: 40.7713024,
        lng: -73.9632393
    }
}, {
    title: 'Chelsea Loft',
    location: {
        lat: 40.7444883,
        lng: -73.9949465
    }
}, {
    title: 'Union Square Open Floor Plan',
    location: {
        lat: 40.7347062,
        lng: -73.9895759
    }
}, {
    title: 'East Village Hip Studio',
    location: {
        lat: 40.7281777,
        lng: -73.984377
    }
}, {
    title: 'TriBeCa Artsy Bachelor Pad',
    location: {
        lat: 40.7195264,
        lng: -74.0089934
    }
}, {
    title: 'Chinatown Homey Space',
    location: {
        lat: 40.7180628,
        lng: -73.9961237
    }
}];

var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.marker = new google.maps.Marker({
        map: map,
        position: this.location(),
        title: this.title(),
        animation: google.maps.Animation.DROP
    });
    this.marker.addListener('click', function() {

        populateInfoWindow(this, largeInfowindow);
        toggleBounce(this)
    });



}

var foursquare_CLIENT_ID = 'E5RPW3KFBNWGODCETUOV2KXBIKDXPGYSE4LE0OKHGSFUD4KO';
var foursquare_CLIENT_SECRET = 'PCKC1QJNNVO55AWV2J5ZQAXWJ4XGAT0X2NO0BXNTZNC3EPGH';
var foursquareUrl;
var streetViewUrl;

var stringStartsWith = function(string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var viewModel = function() {
    var self = this;
    self.locationList = ko.observableArray([]);
    self.filter = ko.observable("");
    self.largeInfowindow = new google.maps.InfoWindow();

    self.toggleBounce = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
    self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div id = "marker-title"><h2>' + marker.title + '</h2></div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.setMarker(null);
            });


            streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=200x100&location=' + marker.position.lat() + ',' + marker.position.lng() + '&fov=90&heading=235&pitch=10';
            $('#marker-title').append('<img src =' + streetViewUrl + '>');
            foursquareUrl = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                foursquare_CLIENT_ID + '&client_secret=' + foursquare_CLIENT_SECRET +
                '&m=foursquare&v=20140806&ll=' + marker.position.lat() + ',' +
                marker.position.lng() + '&query=' + marker.title;
            $.ajax({
                    url: foursquareUrl,
                    cache: false
                })
                .done(function(data) {
                    var link = data.response.groups[0].items[0].tips[0].canonicalUrl;
                    var rating = data.response.groups[0].items[0].venue.rating;
                    if (!link && !rating) {
                        // this means nothing about the address
                        $('#marker-title').append('<h3>This place has not been on Foursquare.</h3>');
                    } else {
                        // append the content after #marker-title in infowindow
                        $('#marker-title').append('<h3>Foursquare Rating: <span class="rating">' +
                            rating + '</span></h3>' + '<a class="fsqure-link" href="' +
                            link + '" target="new">Foursquare Link</a>');
                    }
                })
                .fail(function() {
                    alert('Foursquare data failed to load.');
                });
        }
    }

    self.showInfo = function(location) {
        google.maps.event.trigger(location.marker, 'click')
    }

    initialLocations.forEach(function(item) {
        self.locationList.push(new Location(item));
    });

    this.filterList = ko.computed(function() {
        self.search = this.filter().toLowerCase();
        if (!search) {
            this.locationList().forEach(function(loc) {
                loc.marker.setVisible(true);
            });
            return this.locationList();
        } else {
            return ko.utils.arrayFilter(this.locationList(), function(loc) {
                if (stringStartsWith(loc.title().toLowerCase(), self.search)) {
                    loc.marker.setVisible(true);
                    return true;
                } else {
                    loc.marker.setVisible(false);
                    return false;
                }
            });
        }
    }, this);

}

// Create a new blank array for all the listing markers.
var markers = [];
var initMap = function() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13
    });
    ko.applyBindings(viewModel);

};
