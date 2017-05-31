# Beta Status
The WXTiles service is currently in beta. As such you should expect that there will be changes to the WXTiles API, WXTiles clients, and this documentation.  

The API is versioned by a path parameter: api.wxtiles.com/v1 is the current root of all API calls. Breaking changes will only be made by increasing the version path parameter.

#API Documentation
View the web API documentation [here](./api-docs/). There you will find valid enpdpoints expected response codes, and the structure of responses.

# JS Client Documentation
View the API documentation for the wxTilesjs library [here](./wxtilesjs-docs).

# API Keys
Access to the WXTiles API requires an API Key. This key can be obtained by signing up for a free account at [wxtiles.com](https://wxtiles.com/my-account/). Once you have signed up, you can find your API Key on your account page.

The API Key must be submitted with every request to the WXTiles API. This can be done by either adding an `apikey` header:

```shell
curl https://api.wxtiles.com/v1/wxtiles/layer/ --header 'apikey: your_api_key_here'
```
or by adding an `apikey` parameter to the query string of a URL:

```shell
curl https://api.wxtiles.com/v1/wxtiles/layer/?apikey=your_api_key_here
```

Requests without an API key will not return a successful response.

# Getting Started

WXTiles will render datasets into tiles and allow you to request those tiles for display with popular map libraries. In this example we will create the map below and add observations of radar reflectivity from the Multi-Radar/Multi-Sensor system (MRMS) exposed via WXTiles.

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

![Reflectivity at lowest altitude legend](https://api.wxtiles.com/v1/wxtiles/legend/ncep-mrms-us-reflectivity/reflectivity/small/horizontal.png "Reflectivity at lowest altitude")

## Setting up Leaflet

This example uses the [Leaflet](http://leafletjs.com/) JavaScript library for interactive maps. If you are not familiar with Leaflet then you should check out their [quick start guide](http://leafletjs.com/examples/quick-start.html).


### Preparing the map
The first step is to setup the Leaflet map. Include the Leaflet CSS and JavaScript files in the `head` of your document.

```html
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js"></script>
</head>
```

Include a container in the `body` to render the map inside:

```html
<body>
  <div id="leaflet-map"></div>
<body>
```

And some css to define the height of the map:

```css
#leaflet-map {
  height: 225px;
}
```

In a `.js` file, set up the Leaflet map and add a base map tile layer.
```js
var leafletMap = L.map('leaflet-map', {
    zoom: 5,
  }).setView([-38, 80], 2)

  var baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
  }).addTo(leafletMap)
```

This produces the following map:

![Leaflet example map without overlay](./getting-started/map-without-layer-small.png "Leaflet example map without overlay")

## Adding WXTiles

### Terminology

WXTiles provides a series of *layers* that each represent a particular piece of thematic data that may be rendered into map tiles. Each *layer* has at least one *style* that describes how that data should be drawn, including the unit system (e.g. rain in inches or illimetres). Different *layers* often implement the same *style* or styles (e.g. the rain models of two different forecasting organisations are then drawn in the same fashion).

Each *layer* also has at least one *instance*. Instances typically represent forecast model periods (e.g. the foreacast made at 6am, and the forecast made at 6pm, are two different *instances* of the same *layer*). However, many *layers*, particularly those that represent a collection of observational data, only have one *instance*; representing all currently available information.

### Adding a tile layer

Now that we have a map we can add a WXTiles overlay, which will also be an `L.tileLayer`. The MRMS radar reflectivity layer we want to add is observational, and has a single instance: `"QCComposite"`, and no vertical dimension, but it does have a time dimension. (In fact, this particular product is updated every two minutes with the latest observations.) This layer has multiple styles, but for this example we will pick the default style, called `"reflectivity"`, which has a semi-continuous rainbow colour scheme from -10 to 75 dBZ. Given that we know a time and that the ID of this layer is `"ncep-mrms-us-reflectivity"` we can fill in all the parameters in the url to request PNG tiles to place on our map.

So this template tile URL:
```
https://api.wxtiles.com/v1/{ownerId}/tile/{layerId}/{styleId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```

Will become this:
```
https://api.wxtiles.com/v1/wxtiles/tile/ncep-mrms-us-reflectivity/reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png
```

And then we add our API key to the query string:
```
https://api.wxtiles.com/v1/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png?apikey=your_api_key_here
```

The `{z}`, `{x}`, and `{y}` parameters will be filled in by the map library when it requests tiles. Now we just need construct another layer with our URL and add it to the map.

```js
var radar = L.tileLayer('https://api.wxtiles.com/v1/wxtiles/tile/ncep-mrms-us-reflectivity/reflectivity/QCComposite/2016-07-17T21:16:37Z/0/{z}/{x}/{y}.png', {
		maxNativeZoom: 11,
		tms: true
	}).addTo(leafletMap);
```

Note: We must set `tms` to `true` so that Leaflet knows to flip the `y` coordinate when requesting tiles. See the bottom of [this page](http://leafletjs.com/examples/wms/wms.html) for more information about tile coordiante schemas.

![Leaflet example map with overlay](./getting-started/map-with-layer-small.png "Leaflet example map with overlay")

### Adding the legend

In order for your map readers to interpret the data we need to display a legend for the layer we have added to the map. WXTiles provides a legend as a PNG image for most layers that it renders. If we know the information needed to get a tile URL, then we can get the legend.  

A legend URL for an image legend looks like:

```
https://api.wxtiles.com/v1/{ownerId}/legend/{layerId}/{styleId}/{size}/{orientation}.png
```

So when we substitute:

* "small" or "large" for the size
* "horizontal" or "vertical" for the orientation
* the same values for ownerId, layerId, and styleID as in the tile URL
* and add our API key

Then we end up with:
```
https://api.wxtiles.com/v1/wxtiles/legend/ncep-mrms-us-reflectivity/reflectivity/small/horizontal.png?apikey=your_api_key_here
```

This produces the following image:
![Reflectivity at lowest altitude legend](https://api.wxtiles.com/v1/wxtiles/legend/ncep-mrms-us-reflectivity-dbz/reflectivity/small/horizontal.png "Reflectivity at lowest altitude")

Note that not every layer supports a legend image. For instance, a layer/style that solely shows direction of wind does not have a legend.

# Using the Javascript library

### Including the JavaScript file

You can just include a reference to the WXTiles JavaScript client library by including the following HTML:

```html
<script src="https://wxtiles.github.io/wxtilesjs/dist/wxtiles.js" type="text/javascript"></script>
```

The WXTiles API client will available on the WXTiles global object. For example:

```js
wxTiles.getLayers("wxtiles", {}, callback);
```

### Installing the library via npm

To install the library in to your project using npm you should run:

```shell
npm install wxtiles/wxtilesjs --save
```
(See [installation instructions](https://github.com/wxtiles/wxtilesjs#installation) for more information.)

Once the library is installed into your project you can require in the API library:
```js
var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
```

## Querying for metadata

The above example shows you how to add a single layer to a map. However you must already know the IDs of the layer, style, and instance to display, as well as the times and levels that are available. In order to get that information you need to query the metadata from the WXTiles API. You can do this by using the API directly (API documentation is [here](https://wxtiles.github.io/wxtiles-docs/api-docs/)), but for this example we will use the JavaScript library provided at https://github.com/wxtiles/wxtilesjs. This library, which is autogenerated from the API documentation, can be used to manage interactions with the API.

### Setting up the callback

The following examples use a callback to provide the data retrieved from the API back to your program. A simple callback that will just log the response to the console is shown below.
```js
var callback = function(error, response)
{
  if (error) {
    //Do something with the error.
  }
  console.log(response);
}
```
### Trying it out

This page has been setup with the JavaScript library and the simple callback above so you can open the dev tools of your browser and try out any of the examples below.

### Getting layers

Assuming that we have set up a callback function, then querying for layers is as easy as passing the ID of the owner of the layers, in this case `"wxtiles"`, an empty options object, and the callback we set up earlier.

```js
tilesApi.getLayers('wxtiles', {}, callback);
```

This will get all the layers provided by WXTiles and log them to the console, which (for a single layer) will look something like this:
```json
[
  {
    "styles": [
      {
        "name": "Rotation",
        "label": "Low-level azimuthal shear (0.001/s)",
        "id": "rotation",
        "resources": {
          "jsonLegend": "/wxtiles/legend/ncep-mrms-us-rotationtrack30/rotation.json",
          "legend": "/wxtiles/legend/ncep-mrms-us-rotationtrack30/rotation/<size>/<orientation>.png"
        },
        "description": "Azimuthal shear"
      }
    ],
    "minNativeZoom": 1,
    "name": "Low-level, 30 minute air rotation track",
    "instanceDescription": null,
    "tags": [],
    "laypersonDescription": null,
    "organisation": "NCEP",
    "maxNativeZoom": 16,
    "bounds": {
      "west": -129.9975,
      "east": -60.002502,
      "north": 54.9975,
      "south": 20.002501
    },
    "instanceType": "observational",
    "regions": {
      "840": "United States of America"
    },
    "source": "MRMS",
    "defaults": {
      "style": "rotation"
    },
    "dimensions": [
      "latitude",
      "longitude",
      "time"
    ],
    "id": "ncep-mrms-us-rotationtrack30",
    "resources": {
      "tile": "/wxtiles/tile/ncep-mrms-us-rotationtrack30/<style>/<instance>/<time>/0/{z}/{x}/{y}.png",
      "times": "/wxtiles/layer/ncep-mrms-us-rotationtrack30/instance/<instance>/times/"
    },
    "description": "Maximum azimuthal shear over the layer between 0 and 2km above ground level over the last 30 minutes. The spatial resolution is 0.005 by 0.005 degree with a 2 minute update. Highlights circulations associated with mesocyclones and/or tornadoes in addition to horizontal shear zones at low altitudes. Note that artificially large values are possible directly over radar sites.",
    "instances": [
      {
        "start": "2017-01-27T02:00:33Z",
        "end": "2017-01-27T02:58:12Z",
        "id": "RotationTrack30min",
        "displayName": "RotationTrack30min",
        "created": "2017-01-30T03:22:06.601502Z"
      }
    ]
  }
]
```
The layer metadata includes an array of instances. In this case there is only one instance for the layer. That instance id, `"RotationTrack30min"`, will be used to query for the times and levels that are available for this dataset.

### Getting times

Once we have the `ownerId` (`"wxtiles"`), the `layerId` (`"ncep-mrms-us-rotation-track30"`), and the `instanceId` (`"RotationTrack30min"`) we can query the API for a list of times that are currently available for the dataset.

```js
tilesApi.getTimes('wxtiles', 'ncep-mrms-us-rotation-track30', 'RotationTrack30min', callback);
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

### Getting levels

This dataset does not have levels (i.e. a vertical dimension), so we just set this to `0`.

### Getting the tile URL

Now that we have the instance id and the times we can plug those into the tile URL. The response from the first request to get the layers included a resources field in the definition of each layer.

```json
  "resources": {
      "tile": "/wxtiles/tile/ncep-mrms-us-rotationtrack30/<style>/<instance>/<time>/0/{z}/{x}/{y}.png",
      "times": "/wxtiles/layer/ncep-mrms-us-rotationtrack30/instance/<instance>/times/"
    }
```

Using the tile path provided with the API root (https://api.wxtiles.com/v1) and substituting in an instance id and a time, and assuming that the level is 0, we can transform this URL ...

```
/wxtiles/tile/ncep-mrms-us-rotation-track30/<Style>/<instance>/<time>/<level>/{z}/{x}/{y}.png
```

... into a URL that is ready to be passed to mapping libraries:

```
https://api.wxtiles.com/v1/wxtiles/tile/ncep-mrms-us-rotation-track30/rotation/RotationTrack30min/2016-07-18T14:04:35Z/0/{z}/{x}/{y}.png
```

# Reference

###Anatomy of a tile URL

This is a URL of a tile:

```
https://api.wxtiles.com/v1/wxtiles/tile/ncep-mrms-us-reflectivity/reflectivity/QCComposite/2016-07-17T21:16:37Z/0/10/306/642.png
```

It produces this image:  
![An example tile](./getting-started/example-tile.png "An example tile")

The URL of a tile contains a number of parameters that must be substituted into the url. This is what the url template looks like before parameter substitution.
```
https://api.wxtiles.com/v1/{ownerId}/tile/{layerId}/{styleId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}
```


| Parameter       | Example       				  		          | Meaning
| -------------- 	| -------------							            | -------------
| `ownerId`       | `wxtiles`								              | The owner of the layer.
| `layerId`       | `ncep-mrms-us-reflectivity`         	| The ID of the layer.
| `styleId`       | `reflectivity`                        | The ID of the style.
| `instanceId`    | `QCComposite`							            | The ID of the instance.
| `time`			    | `2016-07-17T21:16:37Z `               | The time slice in the dataset to display.
| `level`			    | `0`										                | The vertical level in the dataset to display.
| `z`     		    | `7`										                | The map zoom level. Set by the map library.
| `x`     		    | `38`									                | The map x position. Set by the map library.
| `y`     		    | `78`									                | The map x position. Set by the map library.
| `extension`	    | `png`									                | PNG image.
