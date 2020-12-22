const _ = require('lodash')

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function cityLocationCoordinateError() {}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class CityLocationCoordinate extends ValueObject {
	constructor(value) {
		// TODO: Limit the max and min number
		if (!_.isFinite(value)) {
			throw cityLocationCoordinateError({ value })
		}
		super(value)
	}

	static random() {
		return new this(_.round(Math.random() * 1000))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityLocationCoordinate, cityLocationCoordinateError }
