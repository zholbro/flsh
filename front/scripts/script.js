"use strict";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global Variables
//

var mymap;
var markersList = [];
var resourceList = [];
var sideNavList = [];
var jsonObject;

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
// Resource Types:
var generalFields = ["name", "type", "description"];
var resourceTypes = {
  "bathroom":         { 
                        "gender": ["Male", "Female", "All Gender"],
                        "cleanliness": 5
                      },
  "water fountain":   {
                        "taste": 5
                      },
  "bikerack": 				{ 
  											"size": "text"
  										},
  "microwave": 				{
  											"cleanliness": 5,
  										}
};





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// General Helpers:
function copyTemplate(id, innerTag){
  var temp = document.getElementById(id)
  if(temp == null){ return null }

  temp = temp.content.querySelector(innerTag);

  if(temp == null){ return null }
  
  //Duplicate it
  return temp.cloneNode(true);
  
}

function getNewId(){
  return Math.floor(Math.random()*100);
}

function startWithCap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
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

  // ** Search Box ** //

  // format JSON map data
  function formatJSON(rawjson) {  // callback that remap fields name
    var json = {},
      key, loc, disp = [];

    for(var i in rawjson)
    {
      disp = rawjson[i].display_name.split(',');  

      key = disp[0] +', '+ disp[1];
      
      loc = L.latLng( rawjson[i].lat, rawjson[i].lon );
      
      json[ key ]= loc; //key,value format
    }
    
    return json;
  }

  var searchOpts = {
      url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
      jsonpParam: 'json_callback',
      formatData: formatJSON,
      zoom: 10,
      minLength: 2,
      autoType: false,
      marker: {
        icon: false,
        animate: false
      }
    };
    
  // Add search box layer  
  mymap.addControl( new L.Control.Search(searchOpts) );

  // **** //

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
  var marker = addMarker(resource(getNewId(), "Bathroom Name!","bathroom", e.latlng))
  marker.closePopup()
  marker.unbindPopup()
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

function addMarker(res){
  var marker = L.marker(res.latlng).addTo(mymap);
  marker.id = res.id;

  res.marker = marker;
  marker.resource = res;

  createDisplayPopup(marker);
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

  delete marker.resource
}

function clearAllMarkers(){
  for(var i = 0; i< markersList.length; i++){
    markersList[i].remove();
  }
  markersList = [];
}

function clearType(type){
  for(var i = markersList.length-1; i>= 0 ; i--){
    if(markersList[i].resource.type == type){
      markersList[i].remove();
      markersList.splice(i,1);
    }
  }
}


function confirmMarker(marker){
  console.log(marker);
  marker.dragging.disable();
  mymap.panTo(marker._latlng);

  var form = document.forms.namedItem("editResource");
  var elements = form.elements;
  for(var field in generalFields){
    marker.resource[generalFields[field]] = elements.namedItem(generalFields[field]).value;
    console.log(elements.namedItem(generalFields[field]).value);
  }

  var fields = resourceTypes[marker.resource["type"]];
  for(var field in fields){
    marker.resource[field] = elements.namedItem(field).value;
  }


  console.log(marker.resource)
  marker.closePopup();

  marker.unbindPopup();

  createDisplayPopup(marker);
  

}

function cancleMarker(marker){
  marker.closePopup();
  removeMarker(marker);
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Marker Popup Setup

function createDisplayPopup(marker){
  var div = copyTemplate("markerPopup", "div")

  //Edit Text
  var p = div.getElementsByClassName("ResourceName")[0];
  p.innerHTML = marker.resource.name;

  p = div.getElementsByClassName("ResourceType")[0];
  p.innerHTML += marker.resource.type;

  //Hook up buttons
  var btn = div.getElementsByClassName("popupButton editButton")[0];
  btn.onclick = function() {createEditPopup(marker);}


  //Attach to marker
  marker.bindPopup(div).openPopup();
  return marker;
}

function createConfirmPopup(marker){

  underlyingEditPopup(marker, function(marker){
      confirmMarker(marker);
      createSideInfo(marker.resource, marker);
  }, cancleMarker)
  return marker;
}


function createEditPopup(marker){
  var div = underlyingEditPopup(marker, confirmMarker, createDisplayPopup)
  return marker;

}

function underlyingEditPopup(marker, onConfirm, onCancel){
  //create basic popup
  var div = copyTemplate("confirmPlacementPopup", "form")
  marker.bindPopup(div).openPopup();

  //Include default bathroom specifics
  displayResourceOptions()
  displaySpecificOptions("bathroom")

  //Hook up buttons
  var btn = div.getElementsByClassName("popupButton yesButton")[0];
  btn.onclick = function() {onConfirm(marker);}

  btn = div.getElementsByClassName("popupButton noButton")[0];
  btn.onclick = function() {onCancel(marker);}

  return div;
}

function displayResourceOptions(){
	var container = document.getElementsByClassName("type")[0];
	while (container.firstChild) {
    container.removeChild(container.firstChild);
	}

	for(var type in resourceTypes){
		var option = document.createElement("option");
		option.setAttribute("value", type);
		option.innerHTML = type;
		container.appendChild(option);
	}
}

function displayChosenOptions(selectClassName){
  var chosenType = document.getElementsByClassName(selectClassName)[0].value;
  displaySpecificOptions(chosenType)
}

function displaySpecificOptions(chosenType){
  var container = document.getElementsByClassName("typeSpecificOptions")[0];
  console.log(container);

  while (container.firstChild) {
      container.removeChild(container.firstChild);
  }
  
  for(var key in resourceTypes[chosenType]){
    var value = resourceTypes[chosenType][key];

    var p = document.createElement("p");
    var text = document.createTextNode( startWithCap(key)+" : " );
    p.appendChild(text);
    if(typeof value  == "string"){
      
      if(value == "text"){
        var input = document.createElement("input");
        input.setAttribute("class", key);
        input.setAttribute("type", "text");
        input.setAttribute("name", key);
        p.appendChild(input);

      }else{
        var textArea = document.createElement("textarea");
        textArea.setAttribute("class", key);
        textArea.setAttribute("name", key);
        p.appendChild(textArea);
      }

      
    }else if(Array.isArray(value)){
      var select = document.createElement("select");
      select.setAttribute("class", key);
      select.setAttribute("name", key);

      for(var el in value){
        var option = document.createElement("option");
        option.setAttribute("value", value[el]);
        option.innerHTML = value[el];

        select.appendChild(option);
      }
      p.appendChild(select);

    }else if(typeof value == "number"){
      for(var i=1; i<value+1; i++){
        var input = document.createElement("input");
        input.setAttribute("class", key+i);
        input.setAttribute("type", "radio");
        input.setAttribute("name", key);
        input.setAttribute("value", i);
        input.setAttribute("id", key+i);
        p.appendChild(input);
        var label = document.createElement("label");
        label.setAttribute("for", key+i);
        label.innerHTML=" "+i+" ";
        p.appendChild(label);
      }
    }

    console.log(p)
    container.appendChild(p);
  }

}

function prepopulate(resource, div){
  var type = resource.type;

  for(var field in generalFields){
    var tag = div.getElementsByClassName(field)[0];

  }
  for(var field in resourceTypes[type]){

  }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Side bar display
//

function createSideInfo(res, marker){
  var div = copyTemplate("sidenavDetails", "div")

  //Edit Text
  var p = div.getElementsByClassName("ResourceName")[0];
  p.innerHTML = res["name"];

  p = div.getElementsByClassName("ResourceType")[0];
  p.innerHTML = res["type"];

  p = div.getElementsByClassName("ResourceDesc")[0];
  p.innerHTML = res["description"] // "temp data to be filled in later...."

  div.onclick=function(){
    mymap.panTo(res["latlng"])
    res.marker.openPopup();
  }

  var sideNav = document.getElementById("display");
  console.log(sideNav);
  sideNav.appendChild(div);

  res["sideDisplay"] = div;
  div.resource = res;
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

function resource(id, name, type, latlng){
  var res = {};
  res.id = id;
  res.name = name;
  res.type = type;
  res.latlng = latlng;
  return res;
}

function placeResources(res){
  //call to backend to get existing resources
  //place in resource list
  resourceList.push(resource(1, "Bathroom One", "bathroom", [36.997625831007376, -122.0592749118805]));
  resourceList.push(resource(2, "Bathroom Two", "bathroom", [36.998182794272694, -122.06208050251009]));
  resourceList.push(resource(3, "Bathroom Three", "bathroom", [36.99976797508337, -122.06116318702699]));
  resourceList.push(resource(4, "Bathroom Four", "bathroom", [36.96654081654286, -122.05548695773611]));
  resourceList.push(resource(5, "Bathroom Five", "bathroom", [36.999121053933074, -122.06070235735824]));
  resourceList.push(resource(6, "Bathroom Six", "bathroom", [36.99958803730273, -122.0619903016802]));
  resourceList.push(resource(7, "Bathroom Seven", "bathroom", [36.99858551901545, -122.06162514382704]));
  resourceList.push(resource(8, "Bathroom Eight", "bathroom", [36.99858980330975, -122.060267174364]));

  for(var i=0; i < resourceList.length; i++){
    if(res == "all" || res == resourceList[i].type){
      var marker = addMarker(resourceList[i]);
      marker.closePopup();

      createSideInfo(resourceList[i]);
    }
  }
}

