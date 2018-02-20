"use strict";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }

  }


function showPosition(position) {
	var map = L.map('mapid').setView([position.coords.latitude, position.coords.longitude], 18);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 25,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);


	var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.");


	
	function formatJSON(rawjson) {	//callback that remap fields name
		var json = {},
			key, loc, disp = [];

		for(var i in rawjson)
		{
			disp = rawjson[i].display_name.split(',');	

			key = disp[0] +', '+ disp[1];
			
			loc = L.latLng( rawjson[i].lat, rawjson[i].lon );
			
			json[ key ]= loc;	//key,value format
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
		
	map.addControl( new L.Control.Search(searchOpts) );
}




