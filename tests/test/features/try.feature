Feature: WXTiles API

  As a client of the WXTiles API
  I want to run tests
  In order to validate the API

  Background:
  Given a "Swagger" API definition at "https://wxtiles.github.io/wxtiles-docs/swagger-definitions/swagger.json"

  Scenario: Get all layers.
  Given an operation with Id "getLayers"
    And request path param "ownerId" equals "wxtiles"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Layers" model

  Scenario: Get a single layer.
    #TODO: This should fail, but this issue means that sub-models are not validated properly: https://github.com/atlantishealthcare/swagger-model-validator/issues/59
  Given an operation with Id "getLayer"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Layer" model

  Scenario: Get an instance.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"
    And an operation with Id "getInstance"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Instance" model

  Scenario: Get the list of times.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"
    And an operation with Id "getTimes"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Times" model

  Scenario: Get the list of levels.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"
    And an operation with Id "getLevels"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Levels" model

  Scenario: Get a tile.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"
  Given an operation with Id "getTile"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "time" equals the "end" of the last instance of the layer request
    And request path param "level" equals "0"
    And request path param "z" equals "8"
    And request path param "x" equals "1"
    And request path param "y2" equals "1"
    And request path param "extension" equals "png"
   When the request is executed
   Then response status is "ok"
    And response type is "image/png"

  Scenario: Get the PNG legend.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"
    And an operation with Id "getPNGLegend"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "size" equals "small"
    And request path param "orientation" equals "horizontal"
   When the request is executed
   Then response status is "ok"
    And response type is "image/png"

  Scenario: Get the JSON legend.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-ndfd-us-windspd-knots"  
    And an operation with Id "getJSONLegend"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "size" equals "small"
    And request path param "orientation" equals "horizontal"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Legend" model
    #TODO: Check the JSON legend on a layer by layer basis?
    #The legend model doesn't seem to have much relation to the thing that is returned.
