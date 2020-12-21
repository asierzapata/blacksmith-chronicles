const _ = require('lodash')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class ValueObject {
	constructor(value) {
		this.isValueObject = true
		this._value = value
	}

	static random() {
		throw new Error('.random() method not implemented')
	}

	equals(value) {
		return _.isEqual(this.toValue(), value.toValue())
	}

	toValue() {
		return this._value
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = ValueObject
