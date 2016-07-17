var leafletExample = {};
var leafletExampleNoOverlay = {};

var mountLeafletMap = function(mountPointId) {
	leafletExample.leafletMap = L.map(mountPointId, {
		zoom: 5,
	}).setView([41.65, -72], 8);

	leafletExample.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExample.leafletMap);

	leafletExample.lightning = L.tileLayer('https://api.wxtiles.com/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T22:00:39Z/0/{z}/{x}/{y}.png', {
		maxZoom: 9,
		tms: true
	}).addTo(leafletExample.leafletMap);
}

var mountLeafletMapNoOverlay = function(mountPointId) {
	leafletExampleNoOverlay.leafletMap = L.map(mountPointId, {
		zoom: 5
	}).setView([41.65, -72], 8);

	leafletExampleNoOverlay.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExampleNoOverlay.leafletMap);
}

module.exports = {
	mountLeafletMap: mountLeafletMap,
	mountLeafletMapNoOverlay: mountLeafletMapNoOverlay
};