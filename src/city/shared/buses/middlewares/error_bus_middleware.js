const _ = require('lodash')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

const errorBusMiddleware = ({ logger }) => (next) => async (action, ...args) => {
	try {
		const result = await next(action, ...args)
		const errors = _.get(result, 'errors', [])
		if (!_.isEmpty(errors)) {
			result.errors = _.map(result.errors, (error) => {
				// eslint-disable-next-line no-param-reassign
				error.meta = _.assign({}, error.meta, {
					correlationId: action.meta.correlationId,
					causationId: action.meta.causationId,
				})
				return error
			})
		}
		if (logger && !_.isEmpty(errors)) {
			_.forEach(result.errors, (error) => logger.error(error))
		}
		return result
	} catch (error) {
		if (logger) logger.error(error)
		throw error
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { errorBusMiddleware }
