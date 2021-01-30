const _ = require('lodash')
const pino = require('pino')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const LOGGER_SOURCES = {
	HTTP_API: 'http_api',
	APPLICATION: 'application',
	MONGO_DB: 'mongo_db',
}

class Logger {
	constructor({ name = '', enabled = true, level = 'info', prettyPrint = false } = {}) {
		if (!name || !_.includes(_.values(LOGGER_SOURCES), name)) {
			throw new Error(`Invalid Logger source: ${name}`)
		}
		const options = { name, enabled, prettyPrint, level }
		if (prettyPrint) {
			options.prettyPrint = {
				levelFirst: true,
				colorize: true,
				translateTime: true,
			}
		}
		this.logger = pino(options)
	}

	debug(...message) {
		return this.logger.debug(...message)
	}

	info(...message) {
		return this.logger.info(...message)
	}

	warn(...message) {
		return this.logger.warn(...message)
	}

	error(...message) {
		return this.logger.error(...message)
	}

	fatal(...message) {
		return this.logger.fatal(...message)
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { LOGGER_SOURCES, Logger }
