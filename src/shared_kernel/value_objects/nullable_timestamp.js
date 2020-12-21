const _ = require('lodash')
const Chance = require('chance')

const { Timestamp, timestampError } = require('shared_kernel/value_objects/timestamp')
const ValueObject = require('shared_kernel/value_objects/value_object')

const chance = new Chance()

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function nullableTimestampError({ value, message = '' } = {}) {
	// return errors.internalServer({
	// 	errorCode: 'invalid-nullable-timestamp',
	// 	value,
	// 	message,
	// })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class NullableTimestamp extends ValueObject {
	constructor(value = '') {
		if (_.isString(value) && _.isEmpty(value)) {
			return super('')
		}
		try {
			const parsedValue = new Timestamp(value)
			return super(parsedValue.toValue())
		} catch (err) {
			if (!errors.isApplicationError(err)) throw err
			switch (err.getErrorCode()) {
				case timestampError().getErrorCode():
					throw nullableTimestampError({ value })
				default:
					throw err
			}
		}
	}

	static now() {
		return new this(new Date())
	}

	static never() {
		return new this()
	}

	static random() {
		return new this(chance.date())
	}

	isEmpty() {
		return this._value === ''
	}

	toISOString() {
		return this._value ? this._value.toISOString() : ''
	}
}

/* ====================================================== */
/*                        Public API                      */
/* ====================================================== */

module.exports = { NullableTimestamp, nullableTimestampError }
