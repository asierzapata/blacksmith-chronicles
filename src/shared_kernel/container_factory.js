const _ = require('lodash')

// Buses
// -----

// TODO: Change event bus for an async one
const {
	SyncInMemoryCommandBus,
	SyncInMemoryQueryBus,
	SyncInMemoryEventBus,
} = require('shared_kernel/buses/buses')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	createContainer,
	createQueryBus,
	createEventBus,
	createCommandBus,
}

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

async function createContainer({
	modules = [],
	middlewares = [],
	startEventHandling = (handler) => handler(),
	startCommandHandling = (handler) => handler(),
	startQueryHandling = (handler) => handler(),
	db,
	busMessagesStore,
	logger,
	envVars,
	sessionValueObject,
	onDestroy = _.noop,
}) {
	if (_.isEmpty(modules)) throw new Error('There should be at least one module')

	const container = {
		moduleDependencyResolvers: {},
		registeredModuleDependencies: {},
		eventHandlers: {},
		commandHandlers: {},
		queryHandlers: {},
	}

	_.each(modules, (module) => {
		// Module Dependency Resolver
		// --------------------------

		const moduleDependencyResolver = module.getDependencyResolver({ envVars, db })
		container.moduleDependencyResolvers[module.name] = () => {
			const registeredModuleDependencies =
				container.registeredModuleDependencies[module.name] || {}
			return { ...moduleDependencyResolver(), ...registeredModuleDependencies }
		}

		// Events
		// ------

		_.each(module.eventHandlers, (handler, eventType) => {
			const currentHandlers = container.eventHandlers[eventType] || []
			let eventHandlers = []
			if (_.isFunction(handler)) {
				eventHandlers = [handler]
			} else if (_.isArray(handler)) {
				eventHandlers = handler
			}
			container.eventHandlers[eventType] = [
				...currentHandlers,
				...eventHandlers.map((_handler) => {
					return async (event, applicationDeps) => {
						const handlerDeps = container.moduleDependencyResolvers[module.name]()
						const result = startEventHandling(
							async () => _handler(event, { ...handlerDeps, ...applicationDeps }),
							eventType,
							module.name
						)
						return result
					}
				}),
			]
		})

		// Commands
		// --------

		_.each(module.commandHandlers, (handler, commandType) => {
			const currentHandler = container.commandHandlers[commandType]
			if (!_.isEmpty(currentHandler)) {
				throw new Error(`"${commandType}" has more than one handle`)
			}
			container.commandHandlers[commandType] = async (command, applicationDeps) => {
				const handlerDeps = container.moduleDependencyResolvers[module.name]()
				const result = startCommandHandling(
					async () => handler(command, { ...handlerDeps, ...applicationDeps }),
					commandType,
					module.name
				)
				return result
			}
		})

		// Queries
		// -------

		_.each(module.queryHandlers, (handler, queryType) => {
			const currentHandler = container.queryHandlers[queryType]
			if (!_.isEmpty(currentHandler)) {
				throw new Error(`"${queryType}" has more than one handler`)
			}
			container.queryHandlers[queryType] = async (query, applicationDeps) => {
				const handlerDeps = container.moduleDependencyResolvers[module.name]()
				const result = startQueryHandling(
					async () => handler(query, { ...handlerDeps, ...applicationDeps }),
					queryType,
					module.name
				)
				return result
			}
		})
	})

	// Buses
	// -----

	const queryBus = createQueryBus({
		handlers: container.queryHandlers,
		middlewares: middlewares.queryBus,
		dependencies: { envVars, logger, busMessagesStore },
	})

	const eventBus = createEventBus({
		handlers: container.eventHandlers,
		middlewares: middlewares.eventBus,
		sessionValueObject,
		queryBus,
		dependencies: { envVars, logger, busMessagesStore },
	})
	const commandBus = createCommandBus({
		handlers: container.commandHandlers,
		middlewares: middlewares.commandBus,
		sessionValueObject,
		queryBus,
		eventBus,
		dependencies: { envVars, logger, busMessagesStore },
	})

	return {
		commandBus,
		queryBus,
		eventBus,
		resolve: (moduleDependencyName) => {
			const [moduleName, dependencyName] = _.split(moduleDependencyName, '.', 2)
			const resolvedDependency = container.moduleDependencyResolvers[moduleName]()[
				dependencyName
			]
			return resolvedDependency
		},
		register: (moduleDependencyName, dependency) => {
			const [moduleName, dependencyName] = _.split(moduleDependencyName, '.', 2)
			container.registeredModuleDependencies[moduleName] = {
				...(container.registeredModuleDependencies[moduleName] || {}),
				[dependencyName]: dependency,
			}
		},
		unregister: (moduleDependencyName) => {
			const [moduleName, dependencyName] = _.split(moduleDependencyName, '.', 2)
			delete container.registeredModuleDependencies[moduleName][dependencyName]
		},
		async destroy() {
			onDestroy()
		},
	}
}

/* ====================================================== */
/*                        Helpers                         */
/* ====================================================== */

function createQueryBus({ handlers, middlewares, dependencies = {} }) {
	const queryBus = new SyncInMemoryQueryBus({
		busMessagesStore: dependencies.busMessagesStore,
		middleware: [
			..._.map(middlewares, (middleware) => middleware(dependencies)),
			() => (query, mockedDependencies = {}) => {
				const queryHandler = handlers[query.getType()]
				if (!queryHandler) {
					throw new Error(`QueryBus | No Handler for "${query.getType()}"`)
				}

				const correlationId = query.getMetadata().correlationId
				const causationId = query.getId()

				return queryHandler(query, {
					...mockedDependencies,
					logger: dependencies.logger,
					queryBus: {
						handle(_query) {
							query.addMetadata({ correlationId, causationId })
							if (mockedDependencies.queryBus) {
								return mockedDependencies.queryBus.handle(_query)
							}
							return queryBus.handle(_query)
						},
					},
				})
			},
		],
	})
	return queryBus
}

function createEventBus({
	handlers,
	middlewares,
	sessionValueObject,
	queryBus,
	dependencies = {},
}) {
	const eventBus = new SyncInMemoryEventBus({
		busMessagesStore: dependencies.busMessagesStore,
		middleware: [
			..._.map(middlewares, (middleware) => middleware(dependencies)),
			() => (event, mockedDependencies = {}) => {
				const eventHandlers = [
					...(handlers[event.getType()] || []),
					...(handlers['*'] || []),
				]
				if (eventHandlers.length === 0) return Promise.resolve()

				const correlationId = event.getMetadata().correlationId
				const causationId = event.getId()
				const session = event.getMetadata().session

				// TODO: use Promise.allSettled as soon as we upgrade to Node.js 12.X.X
				// or use p-queue if we want to control the amount of parallel executions
				return Promise.all(
					eventHandlers.map((eventHandler) =>
						eventHandler(event, {
							...dependencies,
							...mockedDependencies,
							logger: dependencies.logger,
							queryBus: {
								handle(query) {
									query.addMetadata({ correlationId, causationId })
									if (mockedDependencies.queryBus) {
										return mockedDependencies.queryBus.handle(query)
									}
									return queryBus.handle(query)
								},
							},
							eventBus: {
								publish(events, { sync = true } = {}) {
									events.forEach((_event) => {
										_event.addMetadata({
											session: sessionValueObject.fromEvent(session).toValue(),
											correlationId,
											causationId,
										})
									})
									if (mockedDependencies.eventBus) {
										return mockedDependencies.eventBus.publish(events, { sync })
									}
									return eventBus.publish(events, { sync })
								},
							},
						})
					)
				)
			},
		],
	})
	return eventBus
}

function createCommandBus({
	handlers,
	middlewares,
	sessionValueObject,
	queryBus,
	eventBus,
	dependencies = {},
}) {
	const commandBus = new SyncInMemoryCommandBus({
		busMessagesStore: dependencies.busMessagesStore,
		middleware: [
			..._.map(middlewares, (middleware) => middleware(dependencies)),
			() => (command, mockedDependencies = {}) => {
				const commandHandler = handlers[command.getType()]
				if (!commandHandler) {
					throw new Error(`CommandBus | No Handler for "${command.getType()}"`)
				}

				const correlationId = command.getMetadata().correlationId
				const causationId = command.getId()
				const session = command.getMetadata().session

				return commandHandler(command, {
					...mockedDependencies,
					logger: dependencies.logger,
					queryBus: {
						handle(query) {
							query.addMetadata({ correlationId, causationId })
							if (mockedDependencies.queryBus) {
								return mockedDependencies.queryBus.handle(query)
							}
							return queryBus.handle(query)
						},
					},
					eventBus: {
						publish(events, { sync = true } = {}) {
							events.forEach((event) =>
								event.addMetadata({
									session: sessionValueObject.fromEvent(session).toValue(),
									correlationId,
									causationId,
								})
							)
							if (mockedDependencies.eventBus) {
								return mockedDependencies.eventBus.publish(events, { sync })
							}
							return eventBus.publish(events, { sync })
						},
					},
				})
			},
		],
	})
	return commandBus
}
