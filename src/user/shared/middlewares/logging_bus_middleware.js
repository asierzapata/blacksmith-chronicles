const _ = require('lodash')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

const queryOrCommandLoggingBusMiddleware = ({ logger }) => (next) => async (
	commandOrQuery,
	...args
) => {
	const id = commandOrQuery.getId()
	const name = commandOrQuery.getType()
	const occurredOn = commandOrQuery.getOccurredOn()
	const attributes = commandOrQuery.getAttributes()
	const correlationId = commandOrQuery.getMetadata().correlationId
	const causationId = commandOrQuery.getMetadata().causationId

	try {
		if (logger)
			logger.info(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${id}.${name}.request`
			)
		const result = await next(commandOrQuery, ...args)
		if (logger)
			logger.info(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${id}.${name}.success`
			)
		return result
	} catch (err) {
		if (logger)
			logger.error(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${id}.${name}.error ${err.toString()}`
			)
		throw err
	}
}

const eventHandlerLoggingBusMiddleware = ({ logger }) => (next) => async (
	event,
	...args
) => {
	const name = event.getType()
	const id = event.getId()
	const occurredOn = event.getOccurredOn()
	const attributes = event.getAttributes()
	const sync = event.getMetadata().sync
	const correlationId = event.getMetadata().correlationId
	const causationId = event.getMetadata().causationId
	try {
		if (logger)
			logger.info(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${
					sync ? 'sync' : 'async'
				} | ${id}.${name}.handler.request`
			)
		let result
		if (sync) {
			result = await next(event, ...args)
			if (logger)
				logger.info(
					`Correlation: ${correlationId} | Causation: ${causationId} | ${
						sync ? 'sync' : 'async'
					} | ${id}.${name}.handler.success`
				)

			return result
		}

		result = await next(event, ...args)

		if (logger)
			logger.info(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${
					sync ? 'sync' : 'async'
				} | ${id}.${name}.handler.success`
			)

		return result
	} catch (err) {
		if (logger)
			logger.error(
				`Correlation: ${correlationId} | Causation: ${causationId} | ${
					sync ? 'sync' : 'async'
				} | ${id}.${name}.handler.error`
			)
		throw err
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	queryOrCommandLoggingBusMiddleware,
	eventHandlerLoggingBusMiddleware,
}
