require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],"main":[function(require,module,exports){
var leafletExample = require("./leaflet-example.js");

function mountExamples() {
	leafletExample.mountLeafletMap('leaflet-example-start');
	leafletExample.mountLeafletMapNoOverlay('leaflet-example-no-overlay');
	leafletExample.mountLeafletMap('leaflet-example');
}

module.exports = {
	mountExamples: mountExamples
}
},{"./leaflet-example.js":1}]},{},[]);
