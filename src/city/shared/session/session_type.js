const _ = require('lodash')
const chance = require('chance').Chance()

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function sessionTypeError(value) {
	// return errors.internalServer({ errorCode: 'invalid-session-type', value, message: '' })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const SESSION_TYPES = {
	UNAUTHENTICATED: 'unauthenticated',
	AUTHENTICATED: 'authenticated',
	ADMIN: 'admin',
}

const types = _.values(SESSION_TYPES)

class SessionType extends ValueObject {
	constructor(value = '') {
		if (!_.includes(types, value)) {
			throw sessionTypeError(value)
		}
		super(value)
	}

	// Named constructors
	// ------------------

	static random() {
		return new this(chance.pickone(types))
	}

	static unauthenticated() {
		return new this(SESSION_TYPES.UNAUTHENTICATED)
	}

	static authenticated() {
		return new this(SESSION_TYPES.AUTHENTICATED)
	}

	static admin() {
		return new this(SESSION_TYPES.ADMIN)
	}

	// Methods
	// -------

	isUnauthenticated() {
		return this._value === SESSION_TYPES.UNAUTHENTICATED
	}

	isUser() {
		return this.isAdmin() || this.isAuthenticated()
	}

	isAuthenticated() {
		return this._value === SESSION_TYPES.AUTHENTICATED
	}

	isAdmin() {
		return this._value === SESSION_TYPES.ADMIN
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { SessionType, sessionTypeError }
