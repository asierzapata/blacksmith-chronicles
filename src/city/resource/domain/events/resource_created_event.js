const assert = require('assert')

const { Event } = require('shared_kernel/buses/event')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class ResourceCreatedEvent extends Event {
	static get type() {
		return 'city.1.event.resource.created'
	}

	static create(resource) {
		assert(resource, 'Missing resource dependency')
		return new this({
			type: this.type,
			attributes: {
				id: resource.getId().toValue(),
				cityId: resource.getCityId().toValue(),
				type: resource.getType().toValue(),
			},
			meta: {},
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ResourceCreatedEvent }
