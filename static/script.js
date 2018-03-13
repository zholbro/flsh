"use strict";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global Variables
//

var mymap;
var markersList = [];
var resourceList = [];
var sideNavList = [];
var jsonObject;

var host = "http://127.0.0.1:5000";

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
var generalFields = ["name", "type", "building", "floor", "address"];
var resourceTypes = {
  "bathroom":         { 
                        "gender": ["edit", ["Male", "Female", "All Gender"]],
                        "cleanliness": ["review", 5]
                      },
  "water fountain" :  {
                        "taste": ["review", 5]
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

function getAddressFromLatLng(latlng){
  var lat = latlng[0];
  var lng = latlng[1];
  fetch(" https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+
        "&lon="+lng + "&zoom=18&addressdetails=0")
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });
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
  //console.log(e.latlng);
  var marker = createMarker(e.latlng)
  marker.dragging.enable();

  marker.on('dragend', function(event){
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    mymap.panTo(new L.LatLng(position.lat, position.lng))

    createConfirmPopup(marker);
  });

  mymap.addLayer(marker);
  createConfirmPopup(marker);


};


////////////////////////////////////////////////////////////////////////////////////////
// Resource Management:
//

function addResource(marker){
  confirmMarker(marker);

  addResourceServer(marker.resource).then(function(response){
    console.log(response);
    marker.resource.id = response.id;
    createSideInfo(marker.resource);
    resourceList.push(marker.resource);
  });
}

function deleteResource(marker){

  deleteResourceServer(marker.resource).then(function(response){
    removeSideInfo(marker.resource);
    removeMarker(marker);
    //remove from resourceList
    for(var i = 0; i< resourceList.length; i++){
      if( resourceList[i] == marker.resource){
        resourceList.splice(i, 1);
        break;
      }
    }
  });
}

function editResource(marker){
  confirmMarker(marker);
  editSideInfo(marker.resource);
  //tell server

}

function addReview(marker){
  var review = confirmReview(marker);
  review.id = marker.resource.id;
  console.log(marker.resource)
  //marker.resource.reviewList.push(review);
  addReviewServer(review)

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Marker Logic
//
function createMarker(latlng){
  return L.marker(latlng).addTo(mymap);
}

function addMarker(res){
  var marker = L.marker(res.latlng).addTo(mymap);
  marker.id = res.id;

  res.marker = marker;
  marker.resource = res;

  createDisplayPopup(marker);
  markersList.push(marker);

  //console.log(markersList);

  return marker;
}

function removeMarker(marker){
  console.log(marker);
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
  //console.log(marker);
  marker.dragging.disable();
  mymap.panTo(marker._latlng);

  var form = document.forms.namedItem("editResource");
  var elements = form.elements;
  if(marker.resource == null){
    marker.resource = {};
  }
  for(var field in generalFields){
    marker.resource[generalFields[field]] = elements.namedItem(generalFields[field]).value;
    //console.log(elements.namedItem(generalFields[field]).value);
  }

  var type = marker.resource["type"];
  var fields = resourceTypes[type];

  for(var field in fields){
    if(fields[field][0] == "edit"){
      marker.resource[field] = elements.namedItem(field).value;
    }
  }

  marker.resource.marker = marker;
  marker.resource.reviewList = [];

  marker.resource.latlng = [marker._latlng.lat, marker._latlng.lng];

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
  fillBasicDetails(marker, div);

  //Hook up buttons
  setupButtonByClassName(div, "popupButton editButton", function() {createEditPopup(marker);})
  setupButtonByClassName(div, "popupButton reviewButton", function() {createReviewPopup(marker);})
  setupButtonByClassName(div, "popupButton deleteButton", function() {deleteResource(marker);})

  //Attach to marker
  marker.bindPopup(div).openPopup();
  return marker;
}

function createConfirmPopup(marker){

  underlyingEditPopup(marker, addResource, cancleMarker)
  return marker;
}


function createEditPopup(marker){
  var div = underlyingEditPopup(marker, editResource, createDisplayPopup)
  return marker;

}

function underlyingEditPopup(marker, onConfirm, onCancel){
  //create basic popup
  var div = copyTemplate("confirmPlacementPopup", "form")
  marker.bindPopup(div).openPopup();

  //Include default bathroom specifics
  displaySpecificOptions("bathroom", "edit")


  if(marker.resource != null){
    prepopulateEditFields(div, marker);
  }
  //Hook up buttons
  var btn = div.getElementsByClassName("popupButton yesButton")[0];
  btn.onclick = function() {onConfirm(marker);}

  btn = div.getElementsByClassName("popupButton noButton")[0];
  btn.onclick = function() {onCancel(marker);}

  return div;
}

function displayChosenOptions(selectClassName, operation){
  var chosenType = document.getElementsByClassName(selectClassName)[0].value;
  displaySpecificOptions(chosenType, operation)
}

function displaySpecificOptions(chosenType, operation){
  var containerList = document.getElementsByClassName("typeSpecificOptions");
  var container = containerList[containerList.length-1]

  while (container.firstChild) {
      container.removeChild(container.firstChild);
  }

  for(var key in resourceTypes[chosenType]){
    if(resourceTypes[chosenType][key][0] == operation){  
      var value = resourceTypes[chosenType][key][1];

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

      //console.log(p)
      container.appendChild(p);
    }
  }

}

function createReviewPopup(marker){
  //create basic popup
  var div = copyTemplate("reviewPopup", "form")
  marker.bindPopup(div).openPopup();

  //Edit Text
  fillBasicDetails(marker, div);

  //Include type specifics
  displaySpecificOptions(marker.resource.type, "review")

  //Hook up buttons
  setupButtonByClassName(div, "popupButton yesButton", function() {addReview(marker);})
  setupButtonByClassName(div, "popupButton noButton", createDisplayPopup)

  return div;
}

function confirmReview(marker){
  var form = document.forms.namedItem("reviewResource");
  var elements = form.elements;

  var review = {};

  //for(var field in generalFields){

  review['text'] = elements.namedItem('text').value;
    //console.log(elements.namedItem(generalFields[field]).value);
  //}

  var fields = resourceTypes[marker.resource["type"]];
  for(var field in fields){
    if(fields[field][0] == "review"){
      review[field] = elements.namedItem(field).value;
    }
  }

  console.log(review)
  marker.closePopup();
  marker.unbindPopup();

  createDisplayPopup(marker);

  return review;
}

function prepopulateEditFields(div, marker){
  changeValueByClassName(div, "name", marker.resource.name);
  changeValueByClassName(div, "type", marker.resource.type);
  displaySpecificOptions(marker.resource.type, "edit");

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Side bar display
//

function createSideInfo(res){
  var div = copyTemplate("sidenavDetails", "div")

  //Edit Text
  fillBasicDetails(res.marker, div);

  // p = div.getElementsByClassName("ResourceDesc")[0];
  // p.innerHTML = res["description"] // "temp data to be filled in later...."

  div.onclick=function(){
    mymap.panTo(res["latlng"])
    res.marker.openPopup();
    displayReviews(res.id)
  }

  var sideNav = document.getElementById("display");
  //console.log(sideNav);
  sideNav.appendChild(div);

  res["sideDisplay"] = div;
  div.resource = res;
}

function editSideInfo(res){
  var display = res.sideDisplay;

  fillBasicDetails(res.marker, display); 
}

function removeSideInfo(res){
  var display = res.sideDisplay;

  console.log(display);

  display.parentElement.removeChild(display);

}

function displayReviews(id){
  getReviews(id).then(function(response){
    console.log(response)
  })
  
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML Manipulation:
//

function fillBasicDetails(marker, div){
  changeInnerHTMLContentByClassName(div, "ResourceName", marker.resource.name);
  changeInnerHTMLContentByClassName(div, "ResourceType", marker.resource.type);
  changeInnerHTMLContentByClassName(div, "ResourceAddress", marker.resource.address);
  changeInnerHTMLContentByClassName(div, "ResourceBuilding", marker.resource.building);
}

function changeInnerHTMLContentByClassName( div, pClassName, content){
  var p = div.getElementsByClassName(pClassName)[0];
  p.innerHTML = content;
}

function changeValueByClassName( div, className, content){
  var value = div.getElementsByClassName(className)[0];
  value.value = content;
}

function setupButtonByClassName(div, className, onClick){
  var btn = div.getElementsByClassName(className)[0];
  btn.onclick = onClick;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSON Server Comunication
//
function talkToServer(endpoint, method, json ){
  return fetch(host+endpoint, {
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json',
      'ticket': '5711ab5b9a6f33b308f0f4752f255179'
      // this should be 'ticket': localStorage.getItem('FLSHticket')
      },
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // *manual, follow, error
    body: JSON.stringify(json)
  })
  .then(function(response) {
    return response.json();
  }).catch(function(e){
    console.log("error");
    console.log(e)
  });
}


function reformatResource(res){
  var res2 = Object.assign({}, res);

  delete res2.marker;
  delete res2.sideDisplay;

  delete res2.reviewList;

  res2.latitude = res.latlng[0];
  res2.longitude  = res.latlng[1];
  delete res2.latlng;

  return res2;
}

function addResourceServer(res){
  var res2 = reformatResource(res);

  console.log(JSON.stringify(res2))

  return talkToServer('/flsh/new', 'PUT', res2);

}

function deleteResourceServer(res){
  var res2 = {}
  res2.id = res.id

  console.log(JSON.stringify(res2))

  return talkToServer('/flsh/delete', 'DELETE', res2);
}

function addReviewServer(review){
  console.log(JSON.stringify(review))

  return talkToServer('/flsh/add_review', 'PUT', review);
}


function getReviews(id){
  console.log("Getting Reviews:"+ id)

  return fetch(host+'/flsh/get_reviews?id='+id)
  .then(function(response) {
    console.log(response.body);
    return response.json();
  }).then(function(json){
    console.log(json);
    return json;
  })

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Parsing and Organization
//

function parseBathroomlist(jsonData){
      var bathroomList = jsonData['bathrooms']
      
      console.log(bathroomList);
      for (var i = 0; i < bathroomList.length; i++) {
        var resource = {}
        resource.name = bathroomList[i].name;
        resource.building = bathroomList[i].building;
        resource.address = bathroomList[i].address;
        resource.floor = bathroomList[i].floor;
        resource.gender = bathroomList[i].gender;
        resource.cleanliness = bathroomList[i].cleanliness;
        resource.latlng = [bathroomList[i].latitude, bathroomList[i].longitude];
        resource.id = bathroomList[i].id; 
        resource.type = 'bathroom';
        resourceList.push(resource);
      }

      console.log(resourceList)
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

  fetch(host+'/flsh')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
    parseBathroomlist(myJson);
    // for(var entry in myJson){
    //   resourceList.push(entry)
    // }

    for(var i=0; i < resourceList.length; i++){
      if(res == "all" || res == resourceList[i].type){
        var marker = addMarker(resourceList[i]);
        marker.closePopup();

        createSideInfo(resourceList[i]);
      }
    }
  });


  // resourceList.push(resource(1, "Bathroom One", "bathroom", [36.997625831007376, -122.0592749118805]));
  // resourceList.push(resource(2, "Bathroom Two", "bathroom", [36.998182794272694, -122.06208050251009]));
  // resourceList.push(resource(3, "Bathroom Three", "bathroom", [36.99976797508337, -122.06116318702699]));
  // resourceList.push(resource(4, "Bathroom Four", "bathroom", [36.96654081654286, -122.05548695773611]));
  // resourceList.push(resource(5, "Bathroom Five", "bathroom", [36.999121053933074, -122.06070235735824]));
  // resourceList.push(resource(6, "Bathroom Six", "bathroom", [36.99958803730273, -122.0619903016802]));
  // resourceList.push(resource(7, "Bathroom Seven", "bathroom", [36.99858551901545, -122.06162514382704]));
  // resourceList.push(resource(8, "Bathroom Eight", "bathroom", [36.99858980330975, -122.060267174364]));

  
}

