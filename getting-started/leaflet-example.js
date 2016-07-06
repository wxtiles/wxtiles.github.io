var leafletExample = {};
var leafletExampleNoOverlay = {};

function mountLeafletMap(mountPointId) {
	leafletExample.leafletMap = L.map(mountPointId, {
		zoom: 5,
	}).setView([39, -75], 6);

	leafletExample.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExample.leafletMap);

	leafletExample.lightning = L.tileLayer('http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/{z}/{x}/{y}.png', {
		maxZoom: 9,
		tms: true
	}).addTo(leafletExample.leafletMap);
}

function mountLeafletMapNoOverlay(mountPointId) {
	leafletExampleNoOverlay.leafletMap = L.map(mountPointId, {
		zoom: 5
	}).setView([39, -75], 6);

	leafletExampleNoOverlay.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExampleNoOverlay.leafletMap);
}