const _ = require('lodash')
const chance = require('chance').Chance()

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function sessionSourceError() {
	// return errors.internalServer({
	// 	errorCode: 'invalid-session-source',
	// 	value,
	// 	message: '',
	// })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const SESSION_SOURCES = {
	COMMAND_OR_QUERY: 'commandOrQuery',
	EVENT: 'event',
}

const sources = _.values(SESSION_SOURCES)

class SessionSource extends ValueObject {
	constructor(value = '') {
		if (!_.includes(sources, value)) {
			throw sessionSourceError(value)
		}
		super(value)
	}

	// Named constructors
	// ------------------

	static random() {
		return new this(chance.pickone(sources))
	}

	static commandOrQuery() {
		return new this(SESSION_SOURCES.COMMAND_OR_QUERY)
	}

	static event() {
		return new this(SESSION_SOURCES.EVENT)
	}

	// Methods
	// -------

	isEvent() {
		return this._value === SESSION_SOURCES.EVENT
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { SessionSource, sessionSourceError }
