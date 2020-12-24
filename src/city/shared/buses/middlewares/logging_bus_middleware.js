const _ = require('lodash')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

const queryOrCommandLoggingBusMiddleware = ({ logger }) => (next) => async (
	commandOrQuery,
	...args
) => {
	try {
		if (logger) logger.info(getLoggingParamsForCommandOrQueryRequest({ commandOrQuery }))
		const result = await next(commandOrQuery, ...args)
		if (logger) {
			if (!_.isEmpty(result.errors)) {
				logger.error(
					getLoggingParamsForCommandOrQueryError({
						commandOrQuery,
						error: _.first(result.errors),
					})
				)
			} else {
				logger.info(getLoggingParamsForCommandOrQuerySuccess({ commandOrQuery }))
			}
		}
		return result
	} catch (error) {
		if (logger)
			logger.error(
				getLoggingParamsForCommandOrQueryError({
					commandOrQuery,
					error,
				})
			)
		throw error
	}
}

const eventHandlerLoggingBusMiddleware = ({ logger }) => (next) => async (
	event,
	...args
) => {
	try {
		const sync = event.getMetadata().sync

		if (logger) logger.info(getLoggingParamsForEventRequest({ event }))
		let result
		if (sync) {
			result = await next(event, ...args)
			if (logger) {
				const errors = _.get(result, 'errors', [])
				if (!_.isEmpty(errors)) {
					logger.error(
						getLoggingParamsForEventError({
							event,
							error: _.first(errors),
						})
					)
				} else {
					logger.info(getLoggingParamsForEventSuccess({ event }))
				}
			}

			return result
		}

		result = await next(event, ...args)

		if (logger) {
			const errors = _.get(result, 'errors', [])
			if (!_.isEmpty(errors)) {
				logger.error(
					getLoggingParamsForEventError({
						event,
						error: _.first(errors),
					})
				)
			} else {
				logger.info(getLoggingParamsForEventSuccess({ event }))
			}
		}

		return result
	} catch (error) {
		if (logger) logger.error(getLoggingParamsForEventError({ event, error }))
		throw error
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	queryOrCommandLoggingBusMiddleware,
	eventHandlerLoggingBusMiddleware,
}

/* ====================================================== */
/*                        Helpers                         */
/* ====================================================== */

function getLoggingParamsForCommandOrQueryRequest({ commandOrQuery }) {
	const id = commandOrQuery.getId()
	const name = commandOrQuery.getType()
	const correlationId = commandOrQuery.getMetadata().correlationId
	const causationId = commandOrQuery.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${name}.request`,
	}
}

function getLoggingParamsForCommandOrQuerySuccess({ commandOrQuery }) {
	const id = commandOrQuery.getId()
	const name = commandOrQuery.getType()
	const correlationId = commandOrQuery.getMetadata().correlationId
	const causationId = commandOrQuery.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${name}.success`,
	}
}

function getLoggingParamsForCommandOrQueryError({ commandOrQuery }) {
	const id = commandOrQuery.getId()
	const name = commandOrQuery.getType()
	const correlationId = commandOrQuery.getMetadata().correlationId
	const causationId = commandOrQuery.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${name}.error`,
	}
}

function getLoggingParamsForEventRequest({ event }) {
	const name = event.getType()
	const id = event.getId()
	const sync = event.getMetadata().sync
	const correlationId = event.getMetadata().correlationId
	const causationId = event.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${sync ? 'sync' : 'async'}.${name}.handler.request`,
	}
}

function getLoggingParamsForEventSuccess({ event }) {
	const name = event.getType()
	const id = event.getId()
	const sync = event.getMetadata().sync
	const correlationId = event.getMetadata().correlationId
	const causationId = event.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${sync ? 'sync' : 'async'}.${name}.handler.success`,
	}
}

function getLoggingParamsForEventError({ event }) {
	const name = event.getType()
	const id = event.getId()
	const sync = event.getMetadata().sync
	const correlationId = event.getMetadata().correlationId
	const causationId = event.getMetadata().causationId

	return {
		correlationId,
		causationId,
		id,
		name: `${sync ? 'sync' : 'async'}.${name}.handler.error`,
	}
}
