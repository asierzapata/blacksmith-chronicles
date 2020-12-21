const Chance = require('chance')

const ValueObject = require('shared_kernel/value_objects/value_object')

const chance = new Chance()

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function timestampError() {
	// return errors.internalServer({ errorCode: 'invalid-timestamp', value, message })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Timestamp extends ValueObject {
	constructor(value = '') {
		if (!(value instanceof Date)) throw timestampError({ value })
		super(value)
	}

	static now() {
		return new this(new Date())
	}

	static random() {
		return new this(chance.date())
	}

	toISOString() {
		return this._value.toISOString()
	}
}

/* ====================================================== */
/*                        Public API                      */
/* ====================================================== */

module.exports = { Timestamp, timestampError }
