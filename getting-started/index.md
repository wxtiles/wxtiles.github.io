#API Documentation
View the api documentation [here](https://wxtiles.github.io/wxtiles-docs/api-docs/).


#Getting Started

WXTiles will render datasets into tiles and allow you to request those tiles for display with popular map libraries.  
In this example we will create the map below and add the Cloud-to-gound lightning probability (MRMS) layer from WXTiles.

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

![Reflectivity at lowest altitude legend](http://api.wxtiles.com/wxtiles/legend/ncep-mrms-us-reflectivity/QCComposite/small/horizontal.png "Reflectivity at lowest altitude")

##Setting up Leaflet

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
![Leaflet example map without overlay](./getting-started/map-without-layer-small.png "Leaflet example map without overlay")

##Adding WXTiles
###Adding a tile layer
Now that we have a map we can add a WXTiles overlay. We will use the Reflectivity at Lowest Altitude (MRMS RALA) layer. This layer has a single instance: "QCComposite" and no vertical levels. Given that we also know a time and that the id of this layer is "ncep-mrms-us-reflectivity" we can fill in all the parameters in the url to request PNG tiles to place on a map.  

So this:
```
http://api.wxtiles.com/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```
Will become this:
```
https://api.wxtiles.com/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png
```
The {z}, {x}, and {y} parameters will be filled in by the map library when it requests tiles. Now we just need construct another layer with our url and add it to the map.  
```js
var lightningLayer = L.tileLayer('https://api.wxtiles.com/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png', {
		maxZoom: 9,
		tms: true
	}).addTo(leafletMap);
```
Note: We must set tms to true so Leaflet knows to flip the y coordinate when requesting tiles. See the bottom of [this page](http://leafletjs.com/examples/wms/wms.html) for more information. 

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

###Adding the legend

In order for users to interpret the data we need to display a legend for the layer we have added to the map. WXTiles provides a legend as a PNG image for each layer it renders. If we know the information needed to get a tile url, then we can get the legend.  
A legend URL looks like:

```
https://api.wxtiles.com/{ownerId}/legend/{layerId}/{instanceId}/{size}/{orientation}.png
```

So when we substitute:

* "small" or "large" for the size
* "horizontal" or "vertical" for the orientation
* the same values for ownerId, layerId, and instanceId as in the tile URL

then we end up with:
```
https://api.wxtiles.com/wxtiles/legend/ncep-mrms-us-reflectivity/QCComposite/small/horizontal.png
```
That produces the following image:  
![Reflectivity at lowest altitude legend](http://api.wxtiles.com/wxtiles/legend/ncep-mrms-us-reflectivity/QCComposite/small/horizontal.png "Reflectivity at lowest altitude")

#Using the Javascript library

##Querying for metadata

The above example shows you how to add a single layer to a map. However you must already know the ids of the layer and instance to display, as well as the times and levels that are available. In order to get that information you need to query the metadata from the WXTiles api. You can do this by using the API directly (API documentation is [here](https://wxtiles.github.io/wxtiles-docs/api-docs/)), but for this example we will use the javascript library provided at https://github.com/wxtiles/wxtilesjs.  

###Installing the library
To install the library in to your project you should install via npm:
```shell
npm install wxtiles/wxtilesjs --save
```
(See [installation instructions](https://github.com/wxtiles/wxtilesjs#installation) for more information.)

###Import the module
Once the library is installed into your project you can require in the API library:
```js
var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
```

###Getting layers







#Reference

###Anatomy of a tile URL

This is a URL of a tile:
```
https://api.wxtiles.com/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/10/306/642.png
```
It produces this image:  
![An example tile](./getting-started/example-tile.png "An example tile")

The URL of a tile contains a number of parameters that must be substituted into the url. This is what the url template looks like before parameter substitution.
```
http://api.wxtiles.com/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```
  
  
| Parameter     | Example       						          | Meaning
| -------------	| -------------							          | -----
| ownerId       | wxtiles								              | The owner of the dataset.
| layerId       | ncep-mrms-us-reflectivity         	| The id of the layer.
| instanceId    | QCComposite							            | The id of the instance.
| time			    | 2016-07-17T21:16:37Z                | The time slice in the dataset to display.
| level			    | 0										                | The vertical level in the dataset to display.
| z     		    | 7										                | The map zoom level. Set by the map library.
| x     		    | 38									                | The map x position. Set by the map library.
| y     		    | 78									                | The map x position. Set by the map library.
| extension	    | png									                | PNG

In order to get a usable url that you can feed to a map library you must substitute some of the parameters in the url before you hand it off to the map library.

