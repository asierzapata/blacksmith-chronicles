const _ = require('lodash')

const uuid = require('shared_kernel/uuid')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

// function idError({ value, message = '' } = {}) {
// 	return errors.badRequest({ errorCode: 'invalid-id', value, message })
// }

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Id extends ValueObject {
	constructor(value = '') {
		if (!_.isString(value) || !uuid.isValid(value)) {
			// throw idError({ value })
		}
		super(value)
	}

	static random() {
		return new this(uuid.v4())
	}

	static isValid(value) {
		return uuid.isValid(value)
	}
}

/* ====================================================== */
/*                        Public API                      */
/* ====================================================== */

module.exports = {
	Id,
	// idError
}
