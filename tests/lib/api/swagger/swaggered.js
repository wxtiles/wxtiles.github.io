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
				var swaggerFilePath = url.replace("file://", "");

				_private.parseSwagger(null, swaggerFilePath, finishedParsing)
				
			}
			else {
				/*
			 * get the definition resource
			 */
				_private.parseSwagger(null, url, finishedParsing);
			}

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

				if (err)
						return finishedParsing(err);
					else
						return finishedParsing(null, api);

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
