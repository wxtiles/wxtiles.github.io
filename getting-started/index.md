#API Documentation
View the api documentation [here](https://wxtiles.github.io/wxtiles-docs/api-docs/).

#Getting Started

wxTiles will render datasets into tiles and allow you to request those tiles for display with popular map libraries.  
In this example we will create the map below and add the Cloud-to-gound lightning probability (MRMS) layer from WXTiles.
<p id="leaflet-example-start" class="leaflet-example-map"></p>

![Lightning probability legend](http://api.wxtiles.com/wxtiles/legend/noaa-mrms-us-lightning-probability/Next30min/small/horizontal.png "Lightning probability")

###Leaflet

This example uses the [Leaflet](http://leafletjs.com/) library for interactive maps. If you are not familiar with Leaflet then you should check out their [quick start guide](http://leafletjs.com/examples/quick-start.html).


###Preparing the map
The first step is to setup the leaflet map. Include the Leaflet css and javascript files in the head of your page. 
```html
<head>
...
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js"></script>
...
</head>
```
Include a container to place the map inside:
```html
<div id="leaflet-map"></div>
```
And some css to define the height of the map:
```css
#leaflet-map {
  height: 225px;
}
```

Then setup the leaflet map and add a base map tile layer.
```js
var leafletMap = L.map('leaflet-map', {
    zoom: 5,
  }).setView([-38, 80], 2)

  var baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
  }).addTo(leafletMap)
```
And we end up with the map below:
<p id="leaflet-example-no-overlay" class="leaflet-example-map"></p>

###Adding wxtiles
Now that we have a map we can add a WXTiles overlay. We will use the "Cloud-to-gound lightning probability (MRMS)" layer. This layer has a single instance: "Next30min" and no vertical levels. Given that we also know a time and that the id of this layer is "noaa-mrms-us-lightning-probability" we can fill in all the parameters in the url to request PNG tiles to place on a map.  

So this:
```
http://api.wxtiles.com/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```
Will become this:
```
http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/{z}/{x}/{y}.png
```
The {z}, {x}, and {y} parameters will be filled in by the map library when it requests tiles. Now we just need construct another layer with our url and add it to the map.  
```js
var lightningLayer = L.tileLayer('http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/{z}/{x}/{y}.png', {
		maxZoom: 9,
		tms: true
	}).addTo(leafletMap);
```
Note: We must set tms to true so Leaflet knows to flip the y coordinate when requesting tiles. See the bottom of [this page](http://leafletjs.com/examples/wms/wms.html) for more information. 
<p id="leaflet-example" class="leaflet-example-map"></p>

###Adding the legend

In order for users to interpret the data we need to display a legend for the layer we have added to the map. WXTiles provides a legend as a PNG image for each layer it renders.


#Anatomy of a tile URL

This is a URL of a tile:
```
http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/6/18/39.png
```
It produces this image:  
![An example tile](http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/6/18/39.png "An example tile")

The URL of a tile contains a number of parameters that must be substituted into the url. This is what the url template looks like before parameter substitution.
```
http://api.wxtiles.com/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```
  
  
| Parameter     | Example       						          | Meaning
| -------------	| -------------							          | -----
| ownerId       | wxtiles								              | The owner of the dataset.
| layerId       | noaa-mrms-us-lightning-probability	| The id of the layer.
| instanceId    | Next30min								            | The id of the instance.
| time			    | 2016-07-05T01:14:36Z                | The time slice in the dataset to display.
| level			    | 0										                | The vertical level in the dataset to display.
| z     		    | 7										                | The map zoom level. Set by the map library.
| x     		    | 38									                | The map x position. Set by the map library.
| y     		    | 78									                | The map x position. Set by the map library.
| extension	    | png									                | PNG

In order to get a usable url that you can feed to a map library you must substitute some of the parameters in the url before you hand it off to the map library.

