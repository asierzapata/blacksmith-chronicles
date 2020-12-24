const uuid = require('shared_kernel/uuid')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Timestamp } = require('shared_kernel/value_objects/timestamp')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const ERROR_TYPES = {
	PROGRAMMER: 'programmer',
	OPERATIONAL: 'operational',
}

class ApplicationError extends Error {
	static types = ERROR_TYPES

	constructor({
		id = uuid.generateUUID(),
		type = ApplicationError.types.OPERATIONAL,
		occurredOn = Timestamp.now().toISOString(),
		version = 1,
		name,
		message,
		code,
		error,
	}) {
		super(name)
		this.id = id
		this.type = type
		this.name = name
		this.version = version
		this.occurredOn = occurredOn
		this.attributes = {
			code,
			message,
			stack: error.stack,
		}
		this.meta = {}
	}

	// Named constructors
	// ------------------

	static Operational({ name, message, code }) {
		const error = new Error(message)
		return new this({
			type: ApplicationError.types.OPERATIONAL,
			name,
			message,
			code,
			error,
		})
	}

	static Programmer({ name, message, error }) {
		const code = `programmer-error`
		return new this({
			type: ApplicationError.types.PROGRAMMER,
			name,
			message,
			code,
			error,
		})
	}

	// Methods
	// -------

	getId() {
		return this.id
	}

	getType() {
		return this.source
	}

	addMetadata(data) {
		this.meta = {
			...this.meta,
			...data,
		}
	}

	toValue() {
		return {
			id: this.id,
			type: this.type,
			name: this.name,
			version: this.version,
			occurredOn: this.occurredOn,
			attributes: this.attributes,
			meta: this.meta,
		}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ApplicationError }
