const _ = require('lodash')

const { applyMiddleware } = require('shared_kernel/buses/middlewares/apply_middleware')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class SyncInMemoryCommandOrQueryBus {
	constructor({ middleware = [] }) {
		this._handle = applyMiddleware(middleware)
	}

	async handle(...args) {
		const result = await this._handle(...args)
		return result
	}
}

class SyncInMemoryEventBus {
	constructor({ middleware = [], eventStore, env }) {
		this.eventStore = eventStore
		this._handle = applyMiddleware(middleware)
		this.isTesting = _.get(env, 'isTesting', false)
	}

	async publish(events, { sync = true, ...mockedDependencies } = {}) {
		if (this.eventStore) await this.eventStore.save(events)

		if (!sync && this.isTesting) return

		const promises = Promise.all(
			events.map((event) => {
				event.addMetadata({ sync })
				return this._handle(event, mockedDependencies)
			})
		)

		if (!sync) return
		await promises
		return
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	SyncInMemoryCommandBus: SyncInMemoryCommandOrQueryBus,
	SyncInMemoryQueryBus: SyncInMemoryCommandOrQueryBus,
	SyncInMemoryEventBus,
}
