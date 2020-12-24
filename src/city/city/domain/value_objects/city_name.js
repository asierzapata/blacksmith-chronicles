const _ = require('lodash')
const Chance = require('chance')

const chance = new Chance()

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function cityNameError() {
	return new Error('invalid city name')
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class CityName extends ValueObject {
	constructor(value = '') {
		// TODO: refine the max length for the city name
		if (!_.isString(value) || _.isEmpty(value) || value.length > 50) {
			throw cityNameError({ value })
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

module.exports = { CityName, cityNameError }
