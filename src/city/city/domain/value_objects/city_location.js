const ValueObject = require('shared_kernel/value_objects/value_object')

const {
	CityLocationCoordinate,
} = require('city/city/domain/value_objects/city_location_coordinate')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class CityLocation extends ValueObject {
	constructor(value = {}) {
		const x = new CityLocationCoordinate(value.x)
		const y = new CityLocationCoordinate(value.y)
		super({ x, y })
	}

	static random() {
		return new this({
			x: CityLocationCoordinate.random().toValue(),
			y: CityLocationCoordinate.random().toValue(),
		})
	}

	toValue() {
		return {
			x: this._value.x.toValue(),
			y: this._value.y.toValue(),
		}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityLocation }
