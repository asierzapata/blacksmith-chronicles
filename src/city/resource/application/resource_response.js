const _ = require('lodash')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { Resource } = require('city/resource/domain/aggregate/resource_aggregate')

const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

const ResourceResponse = {
	dataResponse,
	errorResponse,
	randomSuccessResponse,
	randomErrorResponse,
}

module.exports = { ResourceResponse }

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

function dataResponse({ resources, meta = {} }) {
	return {
		data: {
			resources: _convertResources(resources),
		},
		meta: { ...meta, module: 'city.resource' },
	}
}
function errorResponse({ errors, meta = {} }) {
	return {
		errors: _convertErrors(errors),
		meta: { ...meta, module: 'city.resource' },
	}
}

function _convertResource(resource) {
	if (!resource) return

	return {
		id: resource.getId().toValue(),
		cityId: resource.getCityId().toValue(),
		value: resource.getValue().toValue(),
		rate: resource.getRate().toValue(),
		type: resource.getType().toValue(),
		createdAt: resource.getCreatedAt().toValue(),
	}
}

function _convertResources(resources) {
	return _.compact(resources.map((resource) => _convertResource(resource)))
}

function _convertError(error) {
	if (!error) return

	if (error.toValue) return error.toValue()
	return ApplicationError.Programmer({ name: error.name, message: error.message, error })
}

function _convertErrors(errors) {
	return _.compact(errors.map((error) => _convertError(error)))
}

function randomSuccessResponse(resources) {
	return dataResponse({
		resources: resources || _.times(_.random(1, 10), () => Resource.random()),
	})
}

function randomErrorResponse(errors) {
	return errorResponse({
		errors: errors || _.times(_.random(1, 10), () => new Error('Random error')),
	})
}
