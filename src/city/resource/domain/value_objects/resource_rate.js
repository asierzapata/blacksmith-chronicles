const _ = require('lodash')
const Chance = require('chance')

const chance = new Chance()

const { ApplicationError } = require('shared_kernel/errors/application_error')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

class InvalidResourceRateError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.invalid_resource_rate'
	}

	static create({
		message = 'Invalid Resource Rate',
		code = 'invalid-resource-rate',
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

class ResourceRate extends ValueObject {
	constructor(value = 0) {
		if (!_.isFinite(value) || value < 0) {
			throw InvalidResourceRateError.create({ value })
		}
		super(value)
	}

	static random() {
		return new this(chance.floating({ min: 0 }))
	}

	calculateValueWithTimePassed({ timePassed }) {
		return this._value * timePassed
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ResourceRate, InvalidResourceRateError }
