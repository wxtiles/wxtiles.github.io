var Validator = require('swagger-model-validator');

module.exports = function () {

	var Given = When = Then = this.defineStep;

	Then(/^the response body is a valid "([^"]*)" model$/, function (modelName, callback) {
		var world = this;
		var Api = world.Api;
		var operation = this.Api.getCurrentOperation();

		var swagger = this.Api.getDefinition().spec;
		var validator = new Validator(swagger);
		var keys = Object.keys(operation.response.body);

		//var validation = swagger.validateModel(modelName, operation.response.body, false, true)

		//var validation = validator.validate(object, swaggerModel, swaggerModels, false, true);
		var validation = validator.validate(operation.response.body, swagger.definitions[modelName], swagger.definitions, true, true);
		if(validation.errorCount > 0) {
			validation.errors.forEach(error => console.log(error))
			return callback(new Error("There were " + validation.errorCount + " validation errors. See console output for details."))
		}
		
		callback();
	});

};