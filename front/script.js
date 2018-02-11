"use strict";

var mymap;
var markersList = [];

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

function createMap(){
	mymap = L.map('mapid');
}

function showPosition(position) {
	mymap = mymap.setView([position.coords.latitude, position.coords.longitude], 18);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 25,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap);
	var bathroomName = "You are here!";
	marker.bindPopup(`<b>${bathroomName}</b><br>I am a popup.`);

	marker.on('click', test);

	mymap.on('click', onMapClick);

}

function onMapClick(e) {
	console.log(e.latlng);
  var marker = addMarker("Bathroom Name!", e.latlng)
  marker.dragging.enable();
  //new L.marker(e.latlng, {draggable:'true'});


  marker.on('dragend', function(event){
  	console.log("End Drag");
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    mymap.panTo(new L.LatLng(position.lat, position.lng))



		marker.bindPopup(
			`<div class="popup">
		    <br>Is this the where you want the marker?<br>
		    Speak now or forever hold your peace<br>
		    <button class="popupButton" type="button" onclick="marker.draggable.disable();" >Yes</button>
		    <button class="popupButton" type="button" onclick="closepopup();" >No</button>
		  </div>`
		).openPopup();


    // if (confirm('Hello')) {
		//     // Save it!
		//     marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    // 		mymap.panTo(new L.LatLng(position.lat, position.lng))
		// } else {
		//     // Do nothing!
		//     marker.remove();
		// }
  });

  mymap.addLayer(marker);
	marker.bindPopup(
		`<div class="popup">
			<br>Is this the where you want the marker?<br>
			Speak now or forever hold your peace<br>
			<button class="popupButton" type="button" onclick="marker.draggable.disable();" >Yes</button>
			<button class="popupButton" type="button" onclick="closepopup()" >No</button>
		</div>`
	).openPopup();

	function closepopup(){
	marker.closePopup();
	}

};

function addMarker(bathroomName, latlng){
	var marker = L.marker(latlng).addTo(mymap);
	marker.bindPopup(`<b>${bathroomName}</b><br>I am a popup.`);
	marker.type = "bathroom";
	markersList.push(marker);
	console.log(markersList);
	return marker;
}

function clearAllMarkers(){
	for(var i = 0; i< markersList.length; i++){
		markersList[i].remove();
	}
	markersList = [];
}

function clearType(type){
	for(var i = markersList.length-1; i>= 0 ; i--){
		if(markersList[i].type == type){
			markersList[i].remove();
			markersList.splice(i,1);
		}
	}
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getJSON('https://nominatim.openstreetmap.org/search?q=165+palo+verde+terrace+santa+cruz+ca&format=json&polygon=1&addressdetails=1&zoom=0',
function(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
    // alert('there was no error, I think');

    var latitude = data[0].lat;
    var longitude = data[0].lon;

    console.log(data[0]);
    console.log('latitude ' + latitude);
    console.log('longitude ' + longitude);

		var mymarker = L.marker([latitude, longitude]).addTo(mymap);
    mymarker.bindPopup("<b>Hello world!</b><br>I am a popup.");

    mymarker.on('click', test);

    // window.open("https://nominatim.openstreetmap.org/search?q=2311+fieldcrest+drive,+Rockwall&format=json&polygon=1&addressdetails=1&zoom=0")
  }
});
