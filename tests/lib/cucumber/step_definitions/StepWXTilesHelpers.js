var Validator = require('swagger-model-validator');
var expect = require('chai').expect;

module.exports = function () {

	var Given = When = Then = this.defineStep;
	var world = this;

	this.Given(/^a request for a layer with an ownerId of "([^"]*)" and a layerId of "([^"]*)"$/, function (ownerId, layerId, callback) {
		var disposableApi = require('../../api/Api');
		var disposableOperation = disposableApi.getOperation("getLayer");
		disposableOperation.request.params.path["ownerId"] = ownerId;
		disposableOperation.request.params.path["layerId"] = layerId;

		disposableOperation.execute(function (response, err) {
			if (err) {
				callback(err);
			}
			// a response should be returned
			expect(disposableOperation.response).not.to.be.null;
			world.layerResponse = disposableOperation.response.body;
			callback();
		});
    });

	Given(/^request path param "([^"]*)" equals the "([^"]*)" of the last instance of the layer request$/, function (param, instanceProperty, callback) {
    var op = this.Api.getCurrentOperation();
		var lastInstance = world.layerResponse.instances[world.layerResponse.instances.length - 1];
		op.request.params.path[param] = lastInstance[instanceProperty];
		callback();
    });
};
