const assert = require('assert')
const uuid = require('shared_kernel/uuid')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Timestamp } = require('shared_kernel/value_objects/timestamp')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class CommandAndQuery {
	constructor({
		id = uuid.generateUUID(),
		type = '',
		occurredOn = Timestamp.now().toISOString(),
		attributes = {},
		meta = {},
	}) {
		assert(type, 'Missing type dependency')
		assert(meta.session, 'Missing session dependency')
		this.id = id
		this.type = type
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

module.exports = {
	Command: CommandAndQuery,
	Query: CommandAndQuery,
}
