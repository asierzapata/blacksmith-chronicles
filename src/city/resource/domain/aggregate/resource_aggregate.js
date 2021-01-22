const AggregateRoot = require('shared_kernel/entities/aggregate_root')

/* ====================================================== */
/*                        Events                          */
/* ====================================================== */

const {
	ResourceCreatedEvent,
} = require('city/resource/domain/events/resource_created_event')
const {
	ResourceDeletedEvent,
} = require('city/resource/domain/events/resource_deleted_event')
const {
	ResourceRateUpdatedEvent,
} = require('city/resource/domain/events/resource_rate_updated_event')
const {
	ResourceValueUpdatedEvent,
} = require('city/resource/domain/events/resource_value_updated_event')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { Timestamp } = require('shared_kernel/value_objects/timestamp')
const { ResourceValue } = require('city/resource/domain/value_objects/resource_value')
const { ResourceRate } = require('city/resource/domain/value_objects/resource_rate')
const { ResourceType } = require('city/resource/domain/value_objects/resource_type')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Resource extends AggregateRoot {
	constructor({ id, cityId, value, rate, type, createdAt }, opts) {
		super({ id, cityId, value, rate, type, createdAt }, opts)
	}

	// Named constructors
	// ------------------

	static async create(
		{ id = Id.random(), cityId, value, rate, type, createdAt = Timestamp.now() },
		opts
	) {
		const resource = new this({ id, cityId, value, rate, type, createdAt }, opts)
		resource.record(ResourceCreatedEvent.create(resource))
		return resource
	}

	static async random(
		{
			id = Id.random(),
			cityId = Id.random(),
			value = ResourceValue.random(),
			rate = ResourceRate.random(),
			type = ResourceType.random(),
			createdAt = Timestamp.random(),
		} = {},
		opts
	) {
		return new this({ id, cityId, value, rate, type, createdAt }, opts)
	}

	// Getters
	// -------

	getId() {
		return this._attributes.id
	}

	getCityId() {
		return this._attributes.cityId
	}

	getValue() {
		return this._attributes.value
	}

	getRate() {
		return this._attributes.rate
	}

	getType() {
		return this._attributes.type
	}

	getCreatedAt() {
		return this._attributes.createdAt
	}

	// Methods
	// -------

	updateRate({ rate }) {
		this._attributes.rate = rate
		this.record(ResourceRateUpdatedEvent.create(this))
	}

	updateValue({ value }) {
		this._attributes.value = value
		this.record(ResourceValueUpdatedEvent.create(this))
	}

	delete() {
		this.record(ResourceDeletedEvent.create(this))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { Resource }
