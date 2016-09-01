Feature: OpenWeatherMap API - Current weather data

  As a client of the OpenWeatherMap API
  I want to run tests
  In order to validate 'Current weather data' operations

  Background:
    #Given a "Swagger" API definition at "https://wxtiles.github.io/wxtiles-docs/swagger-definitions/swagger.json"
    Given a "Swagger" API definition at "http://127.0.0.1:8080/swagger-definitions/swagger.json"

    Scenario: Get Layers
    #Given the endpoint "/{ownerId}/layer/" and method "get"
    Given an operation with Id "getLayers"
    And request path param "ownerId" equals "wxtiles"
    When the request is executed
    Then response status is "ok"