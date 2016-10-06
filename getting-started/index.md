#Beta Status
The WXTiles service is currently in beta. As such you should expect that there will be changes to the WXTiles API, WXTiles clients, and this documentation.  

The API is versioned by a path parameter: api.wxtiles.com/v0 is the current root of all api calls.  
Once version one of the api is released, breaking changes will only be made by increasing the version path parameter. Until then you should expect breaking changes without a change in version.

#API Documentation
View the web api documentation [here](./api-docs/).

#JS Client Documentation
View the api documentation for the wxTilesjs library [here](./wxtilesjs-docs).

#API Keys
Access to the WXTiles API requires an API Key. This key can be obtained by signing up for a free account at [wxtiles.com](https://wxtiles.com/my-account/). Once you have signed up, you can find your API Key on your account page.

The API Key must be submitted with every request to the WXTiles API. This can be done by either adding an "apikey" header:

```
curl https://api.wxtiles.com/v0/wxtiles/layer/ --header 'apikey: your_api_key_here'
```
or by adding an "apikey" parameter to the query string:

```
curl https://api.wxtiles.com/v0/wxtiles/layer/?apikey=your_api_key_here
```

Requests without an API key will not return a successful response.

#Getting Started

WXTiles will render datasets into tiles and allow you to request those tiles for display with popular map libraries.  
In this example we will create the map below and add the Cloud-to-gound lightning probability (MRMS) layer from WXTiles.

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

![Reflectivity at lowest altitude legend](http://api.wxtiles.com/v0/wxtiles/legend/ncep-mrms-us-reflectivity-dbz/QCComposite/small/horizontal.png "Reflectivity at lowest altitude")

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
http://api.wxtiles.com/v0/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```
Will become this:
```
https://api.wxtiles.com/v0/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png
```
And then we add our API key in the query string:
```
https://api.wxtiles.com/v0/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png?apikey=your_api_key_here
```

The {z}, {x}, and {y} parameters will be filled in by the map library when it requests tiles. Now we just need construct another layer with our url and add it to the map.  
```js
var lightningLayer = L.tileLayer('https://api.wxtiles.com/v0/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png', {
		maxNativeZoom: 11,
		tms: true
	}).addTo(leafletMap);
```
Note: We must set tms to true so Leaflet knows to flip the y coordinate when requesting tiles. See the bottom of [this page](http://leafletjs.com/examples/wms/wms.html) for more information.

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

###Adding the legend

In order for users to interpret the data we need to display a legend for the layer we have added to the map. WXTiles provides a legend as a PNG image for each layer it renders. If we know the information needed to get a tile url, then we can get the legend.  
A legend URL looks like:

```
https://api.wxtiles.com/v0/{ownerId}/legend/{layerId}/{instanceId}/{size}/{orientation}.png
```

So when we substitute:

* "small" or "large" for the size
* "horizontal" or "vertical" for the orientation
* the same values for ownerId, layerId, and instanceId as in the tile URL
* and add our API key

then we end up with:
```
https://api.wxtiles.com/v0/wxtiles/legend/ncep-mrms-us-reflectivity/QCComposite/small/horizontal.png?apikey=your_api_key_here
```
That produces the following image:  
![Reflectivity at lowest altitude legend](http://api.wxtiles.com/v0/wxtiles/legend/ncep-mrms-us-reflectivity-dbz/QCComposite/small/horizontal.png "Reflectivity at lowest altitude")

#Using the Javascript library

###Including the JavaScript file
You can just include a reference to the wxtiles JavaScript client library by including the following HTML:
```html
<script src="https://wxtiles.github.io/wxtilesjs/dist/wxtiles.js" type="text/javascript"></script>
```

The WXTiles api client will available on the wxTiiles global object. For example:
```js
wxTiles.getLayers("wxtiles", {}, callback);
```

###Installing the library via npm
To install the library in to your project using npm you should:
```shell
npm install wxtiles/wxtilesjs --save
```
(See [installation instructions](https://github.com/wxtiles/wxtilesjs#installation) for more information.)

Once the library is installed into your project you can require in the API library:
```js
var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
```

##Querying for metadata

The above example shows you how to add a single layer to a map. However you must already know the ids of the layer and instance to display, as well as the times and levels that are available. In order to get that information you need to query the metadata from the WXTiles api. You can do this by using the API directly (API documentation is [here](https://wxtiles.github.io/wxtiles-docs/api-docs/)), but for this example we will use the javascript library provided at https://github.com/wxtiles/wxtilesjs.  

###Setting up the callback
The following examples use a callback to provide the data retrieved from the API back to your program. A simple callback that will just log the response to the console is shown below.
```js
var callback = function(error, response)
{
  if(error) {
    //Do something with the error.
  }

  console.log(response);
}
```
###Trying it out
This page has been setup with the javascript library and the simple callback above so you can open the dev tools of your browser and try out any of the examples below.


###Getting layers
Assuming that we have setup a callback function, then querying for layers is as easy as passing the id of the owner of the layers, in this case 'wxtiles', any empty options object, and the callback we set up earlier.
```js
tilesApi.getLayers('wxtiles', {}, callback);
```

This will get all the layers provided by WXTiles and log them to the console, which (for a single layer) will look something like this:
```json
[
  {
    "id": "ncep-mrms-us-rotation-track-30",
    "instances": [
      {
        "id": "RotationTrack30min",
        "created": "2016-07-19T01:21:32.212193Z"
      }
    ],
    "minNativeZoom": 1,
    "maxNativeZoom": 11,
    "bounds": {
      "west": -129.9975,
      "east": -60.002502,
      "north": 54.9975,
      "south": 20.002501
    },
    "meta": {
      "name": "Rotation track 0-2km AGL 30 minutes (MRMS)",
      "description": "Rotation track 0-2km AGL 30 minutes, 500m above mean sea level",
      "organisation": "NOAA",
      "source": "MRMS",
      "regions": [
        "840"
      ],
      "unit_system": "metric"
    },
    "resources": {
      "tile": "\/wxtiles\/tile\/ncep-mrms-us-rotation-track-30\/<instance>\/<time>\/<level>\/{z}\/{x}\/{y}.png",
      "legend": "\/wxtiles\/legend\/ncep-mrms-us-rotation-track-30\/<instance>\/<size>\/<orientation>.png",
      "jsonlegend": "\/wxtiles\/legend\/ncep-mrms-us-rotation-track-30\/<instance>\/<size>\/<orientation>.json"
    }
  }
]
```
The layer metadata includes an array of instances. In this case there is only one instance for this layer. That instance id, "RotationTrack30min", will be used to query for the times and levels that are available for this dataset.

###Getting times
Once we have the ownerId ("wxtiles"), the layerId ("ncep-mrms-us-rotation-track-30"), and the instanceId ("RotationTrack30min") we can query the API for a list of times that are currently available for the dataset.
```js
tilesApi.getTimes('wxtiles', 'ncep-mrms-us-rotation-track-30', 'RotationTrack30min', callback);
```
This will produce:
```json
[
  "2016-07-18T14:00:37Z",
  "2016-07-18T14:02:39Z",
  "2016-07-18T14:04:35Z",

  ...

  "2016-07-19T02:46:38Z",
  "2016-07-19T02:48:37Z",
  "2016-07-19T02:50:38Z"
]
```

###Getting levels
This dataset has no levels, so we can just set this to zero.

###Getting the tile URL
Now that we have the instance id and the times we can plug those into the tile URL. The response from the first request to get the layers included a resources field in the definition of each layer.

```json
 "resources": {
      "tile": "\/wxtiles\/tile\/ncep-mrms-us-rotation-track-30\/<instance>\/<time>\/<level>\/{z}\/{x}\/{y}.png",
      "legend": "\/wxtiles\/legend\/ncep-mrms-us-rotation-track-30\/<instance>\/<size>\/<orientation>.png",
      "jsonlegend": "\/wxtiles\/legend\/ncep-mrms-us-rotation-track-30\/<instance>\/<size>\/<orientation>.json"
    }
```

Using the tile path provided with the api root (https://api.wxtiles.com) and substituting in an instance id and a time, and assuming that the level is 0, we can transform:
```
/wxtiles/tile/ncep-mrms-us-rotation-track-30/<instance>/<time>/<level>/{z}/{x}/{y}.png
```
into a URL that is ready to be passed to mapping libraries:
```
https://api.wxtiles.com/v0/wxtiles/tile/ncep-mrms-us-rotation-track-30/RotationTrack30min/2016-07-18T14:04:35Z/0/{z}/{x}/{y}.png
```

#Reference

###Anatomy of a tile URL

This is a URL of a tile:
```
https://api.wxtiles.com/v0/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/10/306/642.png
```
It produces this image:  
![An example tile](./getting-started/example-tile.png "An example tile")

The URL of a tile contains a number of parameters that must be substituted into the url. This is what the url template looks like before parameter substitution.
```
https://api.wxtiles.com/v0/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
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
