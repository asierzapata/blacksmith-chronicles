const _ = require('lodash')

const { ApplicationError } = require('shared_kernel/errors/application_error')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

class InvalidCityLocationCoordinateError extends ApplicationError {
	static get name() {
		return 'city.1.error.city.invalid_city_location_coordinate'
	}

	static create({
		message = 'Invalid City Location Coordinate',
		code = 'invalid-city-location-coordinate',
		value,
	} = {}) {
		return this.Operational({
			name: this.name,
			message: `${value} - ${message}`,
			code,
		})
	}
}
/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class CityLocationCoordinate extends ValueObject {
	constructor(value) {
		// TODO: Limit the max and min number
		if (!_.isFinite(value)) {
			throw InvalidCityLocationCoordinateError.create({ value })
		}
		super(value)
	}

	static random() {
		return new this(_.round(Math.random() * 1000))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityLocationCoordinate, InvalidCityLocationCoordinateError }
