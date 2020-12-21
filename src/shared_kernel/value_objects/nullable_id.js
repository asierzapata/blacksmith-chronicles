const _ = require('lodash')

const { Id, idError } = require('shared_kernel/value_objects/id')
const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function nullableIdError({ value, message = '' } = {}) {
	// return errors.badRequest({ errorCode: 'invalid-nullable-id', value, message })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class NullableId extends ValueObject {
	constructor(value = '') {
		if (_.isString(value) && _.isEmpty(value)) {
			return super('')
		}
		try {
			const parsedValue = new Id(value)
			return super(parsedValue.toValue())
		} catch (err) {
			if (!errors.isApplicationError(err)) throw err
			switch (err.getErrorCode()) {
				case idError().getErrorCode():
					throw nullableIdError({ value })
				default:
					throw err
			}
		}
	}

	static empty() {
		return new this()
	}

	static random() {
		return new this(Id.random().toValue())
	}

	isEmpty() {
		return this._value === ''
	}
}

/* ====================================================== */
/*                        Public API                      */
/* ====================================================== */

module.exports = { NullableId, nullableIdError }
