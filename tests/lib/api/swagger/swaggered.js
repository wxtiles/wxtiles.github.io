/**
 * Swagger definition parser.
 * 
 * @author Chris Spiliotopoulos
 */

/*
 * Modules
 */
var async = require('async');
var SwaggerConverter = require('./swagger-converter');
var parser = require('swagger-parser');
var unirest = require('unirest');

/**
 * Swagger definition parser.
 * 
 */
module.exports = function () {

	"use strict";

	String.prototype.startsWith = function (prefix) {
		return this.indexOf(prefix) === 0;
	}

	String.prototype.endsWith = function (suffix) {
		return this.match(suffix + "$") == suffix;
	};

	/*
	 * PRIVATE METHODS
	 */
	var _private = {

		/**
		 * Tries to parse a Swagger definition
		 */
		'parse': function (url, finishedParsing) {

			if (url.startsWith("file://")) {
				var fs = require('fs');
				var swaggerFile = fs.readFileSync(url.replace("file://", ""), 'utf8');

				_private.parseSwagger(null, swaggerFile)
			}
			else {
				/*
			 * get the definition resource
			 */
				_private.getResourceAtUrl(url, _private.parseSwagger, finishedParsing);
			}

		},

		/**
		 * Sends an HTTP GET request to fetch the resource at the specified URL.
		 */
		'getResourceAtUrl': function (url, parseSwagger, finishedParsing) {

			// GET the resource
			unirest.get(url).end(function (response) {

				parseSwagger(response.error, response.body, finishedParsing);
			});
		},

		'parseSwagger': function (err, content, finishedParsing) {

			var opts = {
				validateSchema: false,
				resolve$Refs: false
			};

			/*
			 * try to parse the document using the Swagger 2.0 parser
			 */
			parser.parse(content, opts, function (err, api) {

				if (!err)
					return finishedParsing(null, api);

				/*
				 * try to convert the old Swagger doc into the new format
				 */
				SwaggerConverter(url, function (err, api) {

					if (err)
						return finishedParsing(err);
					else
						return finishedParsing(null, api);
				});

			});
		}

	};

	/*
	 * PUBLIC METHODS
	 */

	return {

		parse: _private.parse

	}

} ();
