Feature: WXTiles API (v1)

  As a client of the WXTiles API (v1)
  I want to run tests
  In order to validate the API

  Background:
  Given a "Swagger" API definition at "file://./../swagger-definitions/v1/swagger.yaml"

  Scenario: Get all layers.
  Given an operation with Id "getLayers"
    And request path param "ownerId" equals "wxtiles"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Layers" model

  Scenario: Get a single layer.
  Given an operation with Id "getLayer"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Layer" model

  Scenario: Get an instance.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-gfs-global-wind"
    And an operation with Id "getInstance"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Instance" model

  Scenario: Get the list of times.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-gfs-global-wind"
    And an operation with Id "getTimes"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Times" model

  Scenario: Get the list of levels.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-gfs-global-wind"
    And an operation with Id "getLevels"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
   When the request is executed
   Then response status is "ok"
    And the response body is a valid "Levels" model

  Scenario: Get a tile.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-gfs-global-wind"
  Given an operation with Id "getTile"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
    And request path param "styleId" equals "wind-speed-direction-filled"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "time" equals the "end" of the last instance of the layer request
    And request path param "level" equals "0"
    And request path param "z" equals "2"
    And request path param "x" equals "0"
    And request path param "y" equals "2"
    And request path param "extension" equals "png"
   When the request is executed
   Then response status is "ok"
    And response type is "image/png"

  Scenario: Get the PNG legend.
  Given a request for a layer with an ownerId of "wxtiles" and a layerId of "ncep-gfs-global-wind"
    And an operation with Id "getPNGLegend"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-gfs-global-wind"
    And request path param "styleId" equals "wind-speed-direction-filled"
    And request path param "instanceId" equals the "id" of the last instance of the layer request
    And request path param "size" equals "small"
    And request path param "orientation" equals "horizontal"
   When the request is executed
   Then response status is "ok"
    And response type is "image/png"
