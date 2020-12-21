const _ = require('lodash')
const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { NullableId } = require('shared_kernel/value_objects/nullable_id')
const { NullableTimestamp } = require('shared_kernel/value_objects/nullable_timestamp')
const { SessionType } = require('city/shared/session/session_type')
const { SessionSource } = require('city/shared/session/session_source')
const { SessionLocation } = require('city/shared/session/session_location')
const { SessionDevice } = require('city/shared/session/session_device')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

function sessionError() {
	// return errors.internalServer({ errorCode: 'invalid-session', value, message: '' })
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Session extends ValueObject {
	constructor({
		type,
		distinctId,
		registeredAt,
		source = SessionSource.commandOrQuery().toValue(),
		featureFlags = {},
		device = {},
		location = {},
		jwtSession = null,
	}) {
		const data = {
			type,
			distinctId,
			source,
			featureFlags,
			device: _.isEmpty(device) ? {} : new SessionDevice(device).toValue(),
			location: _.isEmpty(location) ? {} : new SessionLocation(location).toValue(),
			jwtSession,
			registeredAt,
		}
		if (new SessionType(type).isUser() && new NullableId(distinctId).isEmpty()) {
			throw sessionError(data)
		}
		super(data)
	}

	// Named constructors
	// ------------------

	static unauthenticated({ featureFlags, device, location, source } = {}) {
		return new this({
			type: SessionType.unauthenticated().toValue(),
			distinctId: NullableId.empty().toValue(),
			source,
			featureFlags,
			device,
			location,
		})
	}

	static fromEvent(session) {
		return new this({
			type: session.type,
			distinctId: session.distinctId,
			registeredAt: session.registeredAt,
			source: SessionSource.event().toValue(),
			featureFlags: session.featureFlags,
			device: session.device,
			location: session.location,
			jwtSession: session.jwtSession,
		})
	}

	static random({
		type = SessionType.teacher().toValue(),
		distinctId = new SessionType(type).isUser()
			? NullableId.random().toValue()
			: NullableId.empty().toValue(),
		registeredAt = new SessionType(type).isUser()
			? NullableTimestamp.random().toValue()
			: NullableTimestamp.never().toValue(),
		source = SessionSource.commandOrQuery().toValue(),
		featureFlags,
		device = SessionDevice.random().toValue(),
		location = SessionLocation.random().toValue(),
		jwtSession,
	} = {}) {
		return new this({
			type,
			distinctId,
			registeredAt,
			source,
			featureFlags,
			device,
			location,
			jwtSession,
		})
	}

	// Methods
	// -------

	isAuthenticated() {
		return this._value.type !== 'unauthenticated'
	}

	getType() {
		return this._value.type
	}

	getDistinctId() {
		return this._value.distinctId
	}

	isFromEvent() {
		return this._value.source === 'event'
	}

	// Methods - Feature Flags
	// -----------------------

	setFeatureFlags(featureFlags = {}) {
		this._value.featureFlags = featureFlags
	}

	getFeatureFlags({ asString = false } = {}) {
		if (!asString) {
			return this._value.featureFlags
		}
		const stringifiedFeatureFlags = _.reduce(
			this._value.featureFlags,
			(result, value, key) => {
				if (!value) return result
				return _.isEmpty(result) ? key : `${result},${key}`
			},
			''
		)
		return stringifiedFeatureFlags
	}

	// Methods - Device & Location
	// -------------------------

	getDevice() {
		return this._value.device
	}

	getLocation() {
		return this._value.location
	}
}

/* ====================================================== */
/*                        Public API                      */
/* ====================================================== */

module.exports = { Session, sessionError }
