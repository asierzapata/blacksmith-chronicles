const AggregateRoot = require('shared_kernel/entities/aggregate_root')

/* ====================================================== */
/*                     Domain Errors                      */
/* ====================================================== */

/* ====================================================== */
/*                        Events                          */
/* ====================================================== */

const { CityCreatedEvent } = require('city/city/domain/events/city_created_event')
const { CityDeletedEvent } = require('city/city/domain/events/city_deleted_event')
const { CityRenamedEvent } = require('city/city/domain/events/city_renamed_event')
const { CityRelocatedEvent } = require('city/city/domain/events/city_relocated_event')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { Timestamp } = require('shared_kernel/value_objects/timestamp')
const { CityLocation } = require('city/city/domain/value_objects/city_location')
const { CityName } = require('city/city/domain/value_objects/city_name')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class City extends AggregateRoot {
	constructor({ id, userId, name, location, updatedAt, createdAt }, opts) {
		super({ id, userId, name, location, updatedAt, createdAt }, opts)
	}

	// Named constructors
	// ------------------

	static async create(
		{
			id = Id.random(),
			userId,
			name,
			location,
			updatedAt = Timestamp.now(),
			createdAt = Timestamp.now(),
		},
		opts
	) {
		const city = new this({ id, userId, name, location, updatedAt, createdAt }, opts)
		city.record(CityCreatedEvent.create(city))
		return city
	}

	static async random(
		{
			id = Id.random(),
			userId = Id.random(),
			name = CityName.random(),
			location = CityLocation.random(),
			updatedAt = Timestamp.random(),
			createdAt = Timestamp.random(),
		} = {},
		opts
	) {
		return new this({ id, userId, name, location, updatedAt, createdAt }, opts)
	}

	// Getters
	// -------

	getId() {
		return this._attributes.id
	}

	getUserId() {
		return this._attributes.userId
	}

	getName() {
		return this._attributes.name
	}

	getLocation() {
		return this._attributes.location
	}

	getUpdatedAt() {
		return this._attributes.updatedAt
	}

	getCreatedAt() {
		return this._attributes.createdAt
	}

	// Methods
	// -------

	rename(name) {
		this._attributes.name = name
		this.record(CityRenamedEvent.create(this))
	}

	relocate(location) {
		this._attributes.location = location
		this.record(CityRelocatedEvent.create(this))
	}

	delete() {
		this.record(CityDeletedEvent.create(this))
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { City }
