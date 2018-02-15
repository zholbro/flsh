"use strict";

var mymap;
var markersList = [];
var resourceList = [];

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
	marker.bindPopup("You are here!");

	mymap.on('click', onMapClick);

}

function onMapClick(e) {
	console.log(e.latlng);
  var marker = addMarker("Bathroom Name!","bathroom", e.latlng)
  marker.dragging.enable();

  marker.on('dragend', function(event){
  	console.log("End Drag");
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    mymap.panTo(new L.LatLng(position.lat, position.lng))

    createConfirmPopup(marker);
  });

  mymap.addLayer(marker);
  createConfirmPopup(marker);


};


function confirmMarker(marker){
	console.log(marker);
	marker.dragging.disable();
	mymap.panTo(marker._latlng);
  marker.closePopup();

  marker.unbindPopup();

  createMarkerPopup(marker);
}

function cancleMarker(marker){
	marker.closePopup();
	removeMarker(marker);
}

function addMarker(bathroomName, type, latlng){
	var marker = L.marker(latlng).addTo(mymap);
	marker.name = bathroomName;
	marker.type = type;
	createMarkerPopup(marker);
	markersList.push(marker);

	console.log(markersList);

	return marker;
}

function removeMarker(marker){
	for(var i=0; i< markersList.length; i++){
		if(marker == markersList[i]){
			markersList.splice(i, 1);
		}
	}
	marker.remove();
}

function createConfirmPopup(marker){
	//get Template
	var temp = document.getElementById("confirmPlacementPopup").content.querySelector("div");
	
	//Duplicate it
	var div = temp.cloneNode(true);

	//Hook up buttons
	var btn = div.getElementsByClassName("popupButton yesButton")[0];
	btn.onclick = function() {confirmMarker(marker);}

	btn = div.getElementsByClassName("popupButton noButton")[0];
	btn.onclick = function() {cancleMarker(marker);}

	//Attach to marker
	marker.bindPopup(div).openPopup();
	return marker;
}

function createMarkerPopup(marker){
	//get Template
	var temp = document.getElementById("markerPopup").content.querySelector("div");
	
	//Duplicate it
	var div = temp.cloneNode(true);

	//Edit Text
	var p = div.getElementsByClassName("ResourceName")[0];
	p.innerHTML = marker.name;

	p = div.getElementsByClassName("ResourceType")[0];
	p.innerHTML += marker.type;

	//Hook up buttons
	var btn = div.getElementsByClassName("popupButton editButton")[0];
	btn.onclick = function() {console.log("Open Edit Marker Window?");}


	//Attach to marker
	marker.bindPopup(div).openPopup();
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

//		var mymarker = L.marker([latitude, longitude]).addTo(mymap);
//    mymarker.bindPopup("<b>Hello world!</b><br>I am a popup.");

    // window.open("https://nominatim.openstreetmap.org/search?q=2311+fieldcrest+drive,+Rockwall&format=json&polygon=1&addressdetails=1&zoom=0")
  }
});

function resource(name, type, latlng){
	var res = {};
	res.name = name;
	res.type = type;
	res.latlng = latlng;
	return res;
}

function placeResources(res){
	//call to backend to get existing resources
	//place in resource list
	resourceList.push(resource("Bathroom One", "bathroom", [36.997625831007376, -122.0592749118805]));
	resourceList.push(resource("Bathroom Two", "bathroom", [36.998182794272694, -122.06208050251009]));
	resourceList.push(resource("Bathroom Three", "bathroom", [36.99976797508337, -122.06116318702699]));
	resourceList.push(resource("Bathroom Four", "bathroom", [36.96654081654286, -122.05548695773611]));

	for(var i=0; i < resourceList.length; i++){
		if(res == "all" || res == resourceList[i].type){
			var marker = addMarker(resourceList[i].name, resourceList[i].type, resourceList[i].latlng );
			marker.closePopup();
		}
	}
}
