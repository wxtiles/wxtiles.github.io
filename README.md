API Docs
========
Swagger-ui based API documentation is found in the api-docs directory.

Go here https://wxtiles.github.io/wxtiles-docs/

API Docs Testing
========
The tests directory contains a node project based on [apispots-testing-bdd](https://github.com/chefArchitect/apispots-testing-bdd/). Apispots-testing-bdd (and not the rest of this repository) is MIT licensed. See the tests/LICENSE for details.

The build command:
```shell
npm run build-swagger
```
Will now run the tests before running the build. The tests will run against the production api by default. To change this you must set an environment variable. See the tests [README](tests/README.md) for details. 

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