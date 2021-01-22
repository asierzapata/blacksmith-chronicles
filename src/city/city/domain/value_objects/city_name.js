const _ = require('lodash')
const Chance = require('chance')

const chance = new Chance()

const { ApplicationError } = require('shared_kernel/errors/application_error')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

class InvalidCityNameError extends ApplicationError {
	static get name() {
		return 'city.1.error.city.invalid_city_name'
	}

	static create({
		message = 'Invalid City Name',
		code = 'invalid-city-name',
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

class CityName extends ValueObject {
	constructor(value = '') {
		// TODO: refine the max length for the city name
		if (!_.isString(value) || _.isEmpty(value) || value.length > 50) {
			throw InvalidCityNameError.create({ value })
		}
		super(value)
	}

	static random() {
		return new this(chance.city())
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityName, InvalidCityNameError }
