"use strict";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global Variables
//

var mymap;
var markersList = [];
var resourceList = [];
var jsonObject;
var bathroomList = [];

var tempBathromList = [
  {
    "name":"My Bed Again!!!",
    "building":"Zach Apartment",
    "address":"516 Wilkes Circle",
    "floor":2.000000,
    "gender":"all",
    "cleanliness":2.500000,
    "latitude":36.958787,
    "longitude":122.039592
  },
  {
    "name":"My Bed Once More",
    "building":"Zach Apartment",
    "address":"516 Wilkes Circle",
    "floor":2.000000,
    "gender":"all",
    "cleanliness":2.500000,
    "latitude":36.958787,
    "longitude":122.039592
  }
];

/*
var bathroom = {
name: "",
building: "",
address: "",
floor: "",
gender: "",
cleanliness: "",
latitude: "",
longitude: ""
}
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map Setup
//
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Marker Logic
//

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Side bar display
//

function createSideInfo(res, marker){
  //get Template
  var temp = document.getElementById("sidenavDetails").content.querySelector("div");

  //Duplicate it
  var div = temp.cloneNode(true);

  //Edit Text
  var p = div.getElementsByClassName("ResourceName")[0];
  p.innerHTML = res["name"];

  p = div.getElementsByClassName("ResourceType")[0];
  p.innerHTML = res["type"];

  p = div.getElementsByClassName("ResourceDesc")[0];
  p.innerHTML = "temp data to be filled in later...."

  div.onclick=function(){
    mymap.panTo(res["latlng"])
    marker.openPopup();
  }

  var sideNav = document.getElementById("display");
  console.log(sideNav);
  sideNav.appendChild(div);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSON Comunication
//

var getJSON = function(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      jsonCallback(null, xhr.response);
    } else {
      jsonCallback(status, xhr.response);
    }
  };
  xhr.send();
};

function jsonCallback(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
    // alert('there was no error, I think');
    console.log('json retreival success');

    var latitude = data[0].lat;
    var longitude = data[0].lon;

    // console.log('latitude ' + latitude);
    // console.log('longitude ' + longitude);

    jsonObject = data;
    // console.log(jsonObject);
    // console.log(jsonObject[0]);

    //if()

  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Parsing and Organization
//

function parseBathroomlist(jsonData){

      console.log(jsonData);
      for (var i = 0; i < jsonData.length; i++) {
        console.log(jsonData[i].name);
        console.log(jsonData[i].building);
        console.log(jsonData[i].address);
        console.log(jsonData[i].floor);
        console.log(jsonData[i].gender);
        console.log(jsonData[i].cleanliness);
        console.log(jsonData[i].latitude);
        console.log(jsonData[i].longitude);
        console.log('');
      }
}

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
  resourceList.push(resource("Bathroom Five", "bathroom", [36.999121053933074, -122.06070235735824]));
  resourceList.push(resource("Bathroom Six", "bathroom", [36.99958803730273, -122.0619903016802]));
  resourceList.push(resource("Bathroom Seven", "bathroom", [36.99858551901545, -122.06162514382704]));
  resourceList.push(resource("Bathroom Eight", "bathroom", [36.99858980330975, -122.060267174364]));

  for(var i=0; i < resourceList.length; i++){
    if(res == "all" || res == resourceList[i].type){
      var marker = addMarker(resourceList[i].name, resourceList[i].type, resourceList[i].latlng );
      marker.closePopup();

      createSideInfo(resourceList[i], marker);
    }
  }
}
