var leafletExample = require("./leaflet-example.js");

var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
window.tilesApi = tilesApi;

function mountExamples() {
	// leafletExample.mountLeafletMap('leaflet-example-start');
	// leafletExample.mountLeafletMapNoOverlay('leaflet-example-no-overlay');
	// leafletExample.mountLeafletMap('leaflet-example');
}

module.exports = {
	mountExamples: mountExamples
}