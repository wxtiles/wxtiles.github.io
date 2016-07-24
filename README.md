API Docs
=======
Swagger-ui based API documentation is found in the api-docs directory.

Go here https://wxtiles.github.io/wxtiles-docs/

Code-Gen
========
The yaml file found at swagger-definitions/swagger.yaml is the source of truth for these api docs.

To run the swagger code generator (for swagger.json):
```shell
npm build-swagger-json
```

To run the swagger code generator (for javascript):
```shell
npm build-swagger-js-client
```

To run the swagger code generator (for both):
```shell
npm build-swagger
```

Swagger code generator from here: https://github.com/swagger-api/swagger-codegen
