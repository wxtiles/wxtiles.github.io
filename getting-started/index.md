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

```shell
curl https://api.wxtiles.com/wxtiles/layer/
```
```javascript
wxTile.getLayer("wxTiles");
```

##Leaflet

