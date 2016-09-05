Feature: OpenWeatherMap API - Current weather data

  As a client of the OpenWeatherMap API
  I want to run tests
  In order to validate 'Current weather data' operations

  Background:
    Given a "Swagger" API definition at "https://wxtiles.github.io/wxtiles-docs/swagger-definitions/swagger.json"
    #Given a "Swagger" API definition at "http://127.0.0.1:8080/swagger-definitions/swagger.json"

  Scenario: Get all layers.
    #Given the endpoint "/{ownerId}/layer/" and method "get"
    Given an operation with Id "getLayers"
    And request path param "ownerId" equals "wxtiles"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Layers" model


    #https://api.wxtiles.com/v0/wxtiles/layer/ncep-mrms-us-rotationtrack60-si
    #ncep-ndfd-us-windspd-knots #working
    #ncep-gfs-global-rain-uscs #broke

  Scenario: Get a single layer.
    #This should fail, but this issue means that sub-models are not validated properly. https://github.com/atlantishealthcare/swagger-model-validator/issues/59
    Given an operation with Id "getLayer"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Layer" model

  Scenario: Get an instance.
    Given an operation with Id "getInstance"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Instance" model

  Scenario: Get the list of times.
    Given an operation with Id "getTimes"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Times" model

  Scenario: Get the list of levels.
    Given an operation with Id "getLevels"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Levels" model

  Scenario: Get a tile.
    Given an operation with Id "getTile"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    And request path param "time" equals "2016-09-07T00:00:00Z"
    And request path param "level" equals "0"
    And request path param "z" equals "8"
    And request path param "x" equals "1"
    And request path param "y2" equals "1"
    When the request is executed
    Then response status is "ok"
    #TODO: add a check that we get a png back.

  Scenario: Get the PNG legend.
    Given an operation with Id "getPNGLegend"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    And request path param "size" equals "small"
    And request path param "orientation" equals "horizontal"
    When the request is executed
    Then response status is "ok"
    #TODO: add a check that we get a png back.

  Scenario: Get the JSON legend.
    Given an operation with Id "getJSONLegend"
    And request path param "ownerId" equals "wxtiles"
    And request path param "layerId" equals "ncep-ndfd-us-windspd-knots"
    And request path param "instanceId" equals "20160904163000"
    And request path param "size" equals "small"
    And request path param "orientation" equals "horizontal"
    When the request is executed
    Then response status is "ok"
    And the response body is a valid "Legend" model
