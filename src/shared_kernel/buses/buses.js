const _ = require('lodash')

const { applyMiddleware } = require('shared_kernel/buses/middlewares/apply_middleware')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class SyncInMemoryCommandOrQueryBus {
	constructor({ busMessagesStore, middleware = [] }) {
		this.busMessagesStore = busMessagesStore
		this._handle = applyMiddleware(middleware)
	}

	async handle(...commandsOrQueries) {
		if (this.busMessagesStore) await this.busMessagesStore.save(commandsOrQueries)
		const result = await this._handle(...commandsOrQueries)
		return result
	}
}

class SyncInMemoryEventBus {
	constructor({ middleware = [], busMessagesStore, env }) {
		this.busMessagesStore = busMessagesStore
		this._handle = applyMiddleware(middleware)
		this.isTesting = _.get(env, 'isTesting', false)
	}

	async publish(events, { sync = true, ...mockedDependencies } = {}) {
		if (this.busMessagesStore) await this.busMessagesStore.save(events)

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
