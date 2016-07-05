var leafletExample = {};
function mountLeafletMap(mountPointId) {
	leafletExample.leafletMap = L.map(mountPointId, {
		zoom: 5,
		attributionControl: false
	}).setView([39, -75], 6);

	leafletExample.baseMap = L.tileLayer('https://c.tiles.mapbox.com/v4/aj.Sketchy2/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWV0b2NlYW4iLCJhIjoia1hXZjVfSSJ9.rQPq6XLE0VhVPtcD9Cfw6A', {
		maxZoom: 6,
	}).addTo(leafletExample.leafletMap);

	leafletExample.lightning = L.tileLayer('http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/{z}/{x}/{y}.png', {
		maxZoom: 6,
		tms: true
	}).addTo(leafletExample.leafletMap);
}