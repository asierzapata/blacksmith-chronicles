const _ = require('lodash')
const Chance = require('chance')

const chance = new Chance()

const { ApplicationError } = require('shared_kernel/errors/application_error')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

class InvalidResourceTypeError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.invalid_resource_type'
	}

	static create({
		message = 'Invalid Resource Type',
		code = 'invalid-resource-type',
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

const BASE_TYPES = {
	WOOD: 'wood',
	STONE: 'stone',
}

const SPECIAL_TYPES = {
	CRYSTAL: 'crystal',
	METAL: 'metal',
}

const TYPES = {
	...BASE_TYPES,
	...SPECIAL_TYPES,
}

class ResourceType extends ValueObject {
	static baseTypes = BASE_TYPES
	static specialTypes = SPECIAL_TYPES
	static types = TYPES

	constructor(value = '') {
		if (!_.isString(value) || !_.includes(_.values(ResourceType.types), value)) {
			throw InvalidResourceTypeError.create({ value })
		}
		super(value)
	}

	static random() {
		return new this(chance.pickone(_.values(ResourceType.types)))
	}

	static randomSpecialType() {
		return new this(chance.pickone(_.values(ResourceType.specialTypes)))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ResourceType, InvalidResourceTypeError }
