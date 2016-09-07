#To run the tests.

1. Add .feature files in ./test/features.
1. Set the SWAGGER_HOST environment variable. (The .vscode/launch.json is a good place to do this if debugging locally.)
  * ```json
  "env": {
				"NODE_ENV": "development",
				"SWAGGER_HOST": "127.0.0.1"
			},
	```
	* ```sh
	export SWAGGER_HOST=127.0.0.1
	```
1. Run "npm run test"

These tests use: [apis-testing-bdd](http://apispots.com/projects/bdd/)
