"use strict";


function test(e){
	alert("You clicked the marker at " + e.latlng);

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

var mymap;

function showPosition(position) {
	mymap = L.map('mapid').setView([position.coords.latitude, position.coords.longitude], 18);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 25,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap);
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

	marker.on('click', test);

	function onMapClick(e) {
	  marker = new L.marker(e.latlng, {draggable:'true'});

		marker
		.on('dragend', function(event){
	    var marker = event.target;
	    var position = marker.getLatLng();
	    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
	    mymap.panTo(new L.LatLng(position.lat, position.lng))
	  })
		.on('mouseover', function() {
			if (confirm('Hello')) {
			    // Save it!
			} else {
			    // Do nothing!
			}}
		);
	  mymap.addLayer(marker);
	};

	mymap.on('click', onMapClick);

}

  // var getJSON = function(url, callback) {
  //     var xhr = new XMLHttpRequest();
  //     xhr.open('GET', url, true);
  //     xhr.responseType = 'json';
  //     xhr.onload = function() {
  //       var status = xhr.status;
  //       if (status === 200) {
  //         callback(null, xhr.response);
  //       } else {
  //         callback(status, xhr.response);
  //       }
  //     };
  //     xhr.send();
  // };
  //
  // getJSON('https://nominatim.openstreetmap.org/search?q=165+palo+verde+terrace+santa+cruz+ca&format=json&polygon=1&addressdetails=1&zoom=0',
  // function(err, data) {
  //   if (err !== null) {
  //     alert('Something went wrong: ' + err);
  //   } else {
  //     // alert('there was no error, I think');
  //
  //     var latitude = data[0].lat;
  //     var longitude = data[0].lon;
  //
  //     console.log(data[0]);
  //     console.log('latitude ' + latitude);
  //     console.log('longitude ' + longitude);
  //
	// 		var mymarker = L.marker([latitude, longitude]).addTo(mymap);
	//     mymarker.bindPopup("<b>Hello world!</b><br>I am a popup.");
  //
  //     mymarker.on('click', test);
  //
  //     // window.open("https://nominatim.openstreetmap.org/search?q=2311+fieldcrest+drive,+Rockwall&format=json&polygon=1&addressdetails=1&zoom=0")
  //   }
  // });
