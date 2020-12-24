const _ = require('lodash')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { City } = require('city/city/domain/aggregate/city_aggregate')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

const CityResponse = {
	dataResponse,
	errorResponse,
	randomSuccessResponse,
	randomErrorResponse,
}

module.exports = { CityResponse }

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

function dataResponse({ cities, meta = {} }) {
	return {
		data: {
			cities: _convertCities(cities),
		},
		meta: { ...meta, module: 'city.city' },
	}
}
function errorResponse({ errors, meta = {} }) {
	return {
		data: {
			errors: _convertErrors(errors),
		},
		meta: { ...meta, module: 'city.city' },
	}
}

function _convertCity(city) {
	if (!city) return

	return {
		id: city.getId().toValue(),
		userId: city.getUserId().toValue(),
		name: city.getName().toValue(),
		location: city.getLocation().toValue(),
		updatedAt: city.getUpdatedAt().toValue(),
		createdAt: city.getCreatedAt().toValue(),
	}
}

function _convertCities(cities) {
	return _.compact(cities.map((city) => _convertCity(city)))
}

function _convertError(error) {
	if (!error) return

	// TODO: change this once we refactor the errors
	return {
		name: error.name,
		message: error.message,
		code: error.code,
	}
}

function _convertErrors(cities) {
	return _.compact(cities.map((city) => _convertError(city)))
}

function randomSuccessResponse(cities) {
	return dataResponse({
		cities: cities || _.times(_.random(1, 10), () => City.random()),
	})
}

function randomErrorResponse(errors) {
	return errorResponse({
		errors: errors || _.times(_.random(1, 10), () => new Error()),
	})
}
