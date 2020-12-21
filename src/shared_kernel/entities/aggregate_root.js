const _ = require('lodash')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class AggregateRoot {
	constructor(attributes, { isNew = true } = {}) {
		this.isAggregateRoot = true
		this.isNew = isNew

		// Attributes
		this._attributes = {}
		_.forEach(attributes, (value, key) => {
			if (value) {
				if (!_.isArray(value) && !value.isValueObject) {
					throw new Error('Not a Value Object')
				}
				if (_.isArray(value) && _.some(value, (v) => !v.isValueObject)) {
					throw new Error('Array not full of Value Objects')
				}
			}
			if (key === 'id') {
				this._attributes[key] = value || Id.random()
			} else {
				this._attributes[key] = value
			}
		})
		this._initialAttributes = { ...this._attributes }

		// Events
		this._events = []
	}

	getId() {
		return this._id
	}

	// Methods
	// -------

	deepEquals(data) {
		return _.isEqual(data.isAggregateRoot ? data.attributes() : data, this.attributes())
	}

	equals(entity) {
		return _.isEqual(entity.getId().toValue(), this.getId().toValue())
	}

	attributes() {
		return _.mapValues(this._attributes, (value) => value.toValue())
	}

	changedAttributes() {
		return _.reduce(
			this._attributes,
			(result, value, key) => {
				return {
					...result,
					[key]: this.isNew || !value.equals(this._initialAttributes[key]),
				}
			},
			{}
		)
	}

	// Events
	// ------

	record(event) {
		this._events.push(event)
	}

	pullDomainEvents() {
		const events = this._events
		this._events = []
		return events
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = AggregateRoot
