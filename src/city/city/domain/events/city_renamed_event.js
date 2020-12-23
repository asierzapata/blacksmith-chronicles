const assert = require('assert')

const { Event } = require('shared_kernel/buses/event')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class CityRenamedEvent extends Event {
	static get type() {
		return 'city.1.event.city.renamed'
	}

	static create(city) {
		assert(city, 'Missing city dependency')
		return new this({
			type: this.type,
			attributes: {
				id: city.getId().toValue(),
			},
			meta: {},
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityRenamedEvent }
