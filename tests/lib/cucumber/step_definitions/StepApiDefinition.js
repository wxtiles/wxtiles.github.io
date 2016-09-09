/*
 * Modules
 */
var nconf = require('nconf');
var strformat = require('strformat');

module.exports = function() {

	var Given = When = Then = this.defineStep;
	nconf.argv().env();

	/**
	 * Given
	 */
	Given(/^a "([^"]*)" API definition at "([^"]*)"$/, function (type, url, cb) {

		var world = this;

		var Api = world.Api;

		// replace any property placeholders in the URL
		url = strformat(url, nconf.get());

		/*
		 * parse the API definition
		 */
		Api.parseDefinition( type, url, function(err, definition){

			//After parsing the swagger spec, set the host from the environment config.
			var swaggerHost = nconf.get('SWAGGER_HOST');
			if(swaggerHost && definition.spec) {
				definition.spec.host = swaggerHost;
			}
			cb(err);
		});



	});


};
