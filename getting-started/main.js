var leafletExample = require("./leaflet-example.js");

var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
window.tilesApi = tilesApi;

window.callback = function(error, response)
{
  if(error) {
    console.error(error);
  }

  console.log(response);
}

function mountExamples() {
	// leafletExample.mountLeafletMap('leaflet-example-start');
	// leafletExample.mountLeafletMapNoOverlay('leaflet-example-no-overlay');
	// leafletExample.mountLeafletMap('leaflet-example');
}

module.exports = {
	mountExamples: mountExamples
}