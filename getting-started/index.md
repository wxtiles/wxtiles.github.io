#API Documentation
View the api documentation [here](https://wxtiles.github.io/wxtiles-docs/api-docs/).

#Getting Started

wxTiles will render datasets into tiles.

##Getting tiles

This is a URL of a tile.
```
http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/7/38/78.png
```
It produces this image:  
![An example tile](http://api.wxtiles.com/wxtiles/tile/noaa-mrms-us-lightning-probability/Next30min/2016-07-05T01:14:36Z/0/7/38/78.png "An example tile")

The URL of a tile contains a number of parameters that must be substituted into the url. This is what the url template looks like before parameter substitution.
```
http://api.wxtiles.com/{ownerId}/tile/{layerId}/{instanceId}/{time}/{level}/{zCoord}/{xCoord}/{yCoord}.{extension}
```
  
  
| Parameter     | Example       						| Meaning |
| -------------	| -------------							| ----- |
| ownerId       | wxtiles								| The owner of the dataset.	|
| layerId       | noaa-mrms-us-lightning-probability	| The id of the layer.		|
| instanceId    | Next30min								| The id of the instance.	|
| time			| 2016-07-05T01:14:36Z					| TBA
| level			| 0										| TBA
| zCoord		| 7										| TBA
| xCoord		| 38									| TBA
| yCoord		| 78									| TBA
| extention		| png									| TBA

In order to get a usable url that you can feed to a map library you must substitute some of the parameters in the url before you hand it off to the map library.


##Leaflet
<code>Put a leaflet example map here.
Will have to include the js in the index.html and use a js hook to know when to mount the map.
See: http://ricostacruz.com/flatdoc/#customizing-basic-javascript-hooks</code>

<p id="leaflet-example"></p>

```js
var leafletMap = leaflet.map('leafletMap', {
    zoom: 5,
    attributionControl: false
  }).setView([-38, 80], 2)

  var baseMap = leaflet.tileLayer('https://c.tiles.mapbox.com/v4/aj.Sketchy2/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWV0b2NlYW4iLCJhIjoia1hXZjVfSSJ9.rQPq6XLE0VhVPtcD9Cfw6A', {
    maxZoom: 18
  }).addTo(leafletMap)
  ```