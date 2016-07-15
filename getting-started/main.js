var leafletExample = require("./leaflet-example.js");

function mountExamples() {
	leafletExample.mountLeafletMap('leaflet-example-start');
	leafletExample.mountLeafletMapNoOverlay('leaflet-example-no-overlay');
	leafletExample.mountLeafletMap('leaflet-example');
}

module.exports = {
	mountExamples: mountExamples
}