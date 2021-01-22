const assert = require('assert')

const { Event } = require('shared_kernel/buses/event')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class ResourceRateUpdatedEvent extends Event {
	static get type() {
		return 'city.1.event.resource.rate_updated'
	}

	static create(resource) {
		assert(resource, 'Missing resource dependency')
		return new this({
			type: this.type,
			attributes: {
				id: resource.getId().toValue(),
				cityId: resource.getCityId().toValue(),
				value: resource.getValue().toValue(),
				rate: resource.getRate().toValue(),
			},
			meta: {},
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ResourceRateUpdatedEvent }
