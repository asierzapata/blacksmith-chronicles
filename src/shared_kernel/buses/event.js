const assert = require('assert')
const uuid = require('shared_kernel/uuid')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Timestamp } = require('shared_kernel/value_objects/timestamp')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class Event {
	constructor({
		id = uuid.generateUUID(),
		type = '',
		version = 1,
		occurredOn = Timestamp.now().toISOString(),
		attributes = {},
		meta = {},
	}) {
		assert(id, 'Missing id dependency')
		assert(type, 'Missing type dependency')
		assert(occurredOn, 'Missing occurredOn dependency')
		assert(attributes.id, 'Missing attributes.id dependency')
		this.id = id
		this.type = type
		this.version = version
		this.occurredOn = occurredOn
		this.attributes = attributes
		this.meta = meta
	}

	// Named constructors
	// ------------------

	// Methods
	// -------

	getId() {
		return this.id
	}

	getType() {
		return this.type
	}

	getOccurredOn() {
		return this.occurredOn
	}

	getVersion() {
		return this.version
	}

	getAttributes() {
		return this.attributes
	}

	getMetadata() {
		return this.meta
	}

	addMetadata(data) {
		this.meta = {
			...this.meta,
			...data,
		}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { Event }
