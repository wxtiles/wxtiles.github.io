API Docs
=======
Swagger-ui based API documentation is found in the api-docs directory.

Code-Gen
========
The yaml file found at swagger-definitions/swagger.yaml is the source of truth for these api docs.

To run the swagger code generator (for swagger.json):
```
npm build-swagger-json
```

To run the swagger code generator (for javascript):
```
npm build-swagger-js-client
```

To run the swagger code generator (for both):
```
npm build-swagger
```

Swagger code generator from here: https://github.com/swagger-api/swagger-codegen