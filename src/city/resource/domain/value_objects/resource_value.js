const _ = require('lodash')
const Chance = require('chance')

const chance = new Chance()

const { ApplicationError } = require('shared_kernel/errors/application_error')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

class InvalidResourceValueError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.invalid_resource_value'
	}

	static create({
		message = 'Invalid Resource Value',
		code = 'invalid-resource-value',
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

class ResourceValue extends ValueObject {
	constructor(value = 0) {
		if (!_.isFinite(value) || value < 0) {
			throw InvalidResourceValueError.create({ value })
		}
		super(value)
	}

	static random() {
		return new this(chance.integer({ min: 0 }))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ResourceValue, InvalidResourceValueError }
