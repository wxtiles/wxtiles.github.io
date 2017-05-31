To run the tests.
=========

1. Add .feature files in ./test/features.
2. Set the SWAGGER_HOST environment variable.
* The .vscode/launch.json is a good place to do this if debugging locally.
```json
"env": {
	"NODE_ENV": "development",
	"SWAGGER_HOST": "127.0.0.1"
},
```
* Or just do it in the shell.
```sh
export SWAGGER_HOST=127.0.0.1
```
3. Run `APIKEY=YourAPIKey npm run test`. Note that the `APIKEY` environment variable must be a valid API key. It can also be set in the same way that `SWAGGER_HOST` is set.

These tests use: [apis-testing-bdd](http://apispots.com/projects/bdd/)
