const assert = require('assert')

const { Event } = require('shared_kernel/buses/event')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class CityCreatedEvent extends Event {
	static get type() {
		return 'city.1.event.city.created'
	}

	static create(city) {
		assert(city, 'Missing city dependency')
		return new this({
			type: this.type,
			attributes: {
				id: city.getId().toValue(),
				location: city.getLocation().toValue(),
			},
			meta: {},
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityCreatedEvent }
