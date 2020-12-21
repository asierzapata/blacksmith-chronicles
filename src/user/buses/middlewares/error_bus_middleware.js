/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

const errorBusMiddleware = ({ logger }) => (next) => async (action, ...args) => {
	try {
		const result = await next(action, ...args)
		return result
	} catch (err) {
		if (logger) logger.error(err)
		throw err
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { errorBusMiddleware }
