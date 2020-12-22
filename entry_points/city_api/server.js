const express = require('express')
const assert = require('assert')
const expressPinoLogger = require('express-pino-logger')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const yes = require('yes-https')
const helmet = require('helmet')
const cors = require('cors')

const env = require('city/shared/env')
const uuid = require('shared_kernel/uuid')
const HTTPServer = require('city_api/services/http_server')
const { Logger, LOGGER_SOURCES } = require('city_api/services/logger')

/* ====================================================== */
/*                      Middleware                        */
/* ====================================================== */

const authenticationMiddleware = require('city_api/middlewares/authentication')

/* ====================================================== */
/*                        Routes                          */
/* ====================================================== */

const api = require('city_api/api')

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

class Server {
	constructor() {
		this.app = express()
		this.server = new HTTPServer({ app: this.app, port: env.PORT })
	}

	async start({
		commandBus,
		queryBus,
		eventBus,
		geolocationService,
		authenticationService,
	}) {
		assert(queryBus, 'Missing queryBus dependency')
		assert(commandBus, 'Missing commandBus dependency')
		assert(eventBus, 'Missing eventBus dependency')

		this.app.set('port', env.PORT)

		this.app.use(yes())
		this.app.use(helmet())
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: false }))
		this.app.use(cookieParser())

		if (!env.isProduction) {
			this.app.use(cors())
		}

		// Logging
		// -------

		const expressApplicationLogger = new Logger({
			name: LOGGER_SOURCES.HTTP_API,
			enabled: !env.isTesting && env.logging.enabled,
			level: env.logging.level,
			prettyPrint: !env.isProduction && !env.isStaging,
		})

		const router = express.Router()

		router.use((req, res, next) => {
			req.id = uuid.generateUUID()
			return next()
		})

		if (env.isDevelopment) {
			router.use(
				expressPinoLogger({
					logger: expressApplicationLogger.logger,
					genReqId: (req) => req.id,
					serializers: {
						req: (req) => ({
							id: req.id,
							method: req.method,
							url: req.url ? req.url.path || req.url : undefined,
							body: req.body,
						}),
						res: (res) => ({
							statusCode: res.statusCode,
							errorCode: res.errorCode,
							error: res.error,
						}),
						err: (err) => ({
							type: err.constructor.name,
							message: err.message,
							stack: err.stack,
						}),
					},
				})
			)
		}

		// Dependency Injection
		// --------------------

		const containerMiddleware = (req, res, next) => {
			const requestCorrelationId = uuid.generateUUID()

			req.id = requestCorrelationId
			req.commandBus = {
				handle: (command) => {
					if (req.id) {
						command.addMetadata({ correlationId: req.id, causationId: req.id })
					}
					return commandBus.handle(command)
				},
			}
			req.queryBus = {
				handle: (query) => {
					if (req.id) {
						query.addMetadata({ correlationId: req.id, causationId: req.id })
					}
					return queryBus.handle(query)
				},
			}
			req.geolocationService = geolocationService
			req.authenticationService = authenticationService
			return next()
		}

		router.use(containerMiddleware)
		router.use(authenticationMiddleware.authenticate)

		// API
		// -----

		router.use('/api', api)

		// Error Handling
		// --------------

		this.app.use(router)

		// // 1. Error Handling middleware is for making sure the error has the CORRECT FORMAT
		// this.app.use((err, req, res, next) => {
		// 	let error = err
		// 	// If it's not an Application error => Convert it to an 'uncaught' error
		// 	if (!errors.isApplicationError(err)) {
		// 		error = errors.uncaught(err)
		// 	}

		// 	if (error.addCustomAttributes) {
		// 		// Add more information to the error
		// 		error.addCustomAttributes({
		// 			method: req.method,
		// 			url: req.originalUrl,
		// 			referer: req.headers.referer,
		// 			params: req.params,
		// 			body: req.body,
		// 			query: req.query,
		// 		})
		// 	}

		// 	return next(error)
		// })

		// // 2. Error Handling middleware is for ALERTING New Relic and RESPONDING (if necessary)
		// this.app.use((err, req, res, next) => {
		// 	const customParameters = errors.getLogFormat(err)

		// 	// If the error happened after responding => log to New Relic as an error
		// 	if (res.headersSent) {
		// 		customParameters.background = 1
		// 		newrelic.noticeError(err, customParameters)
		// 		// Delegate to the default error handling mechanisms in Express
		// 		return next(err)
		// 	}

		// 	// If not replied yet, add custom parameters to NR Transaction
		// 	_.each(customParameters, (value, name) => {
		// 		newrelic.addCustomAttribute(name, value)
		// 	})

		// 	// If the error should be alerted => log to New Relic as an error
		// 	if (err.shouldAlert) {
		// 		newrelic.noticeError(err, customParameters)
		// 	}

		// 	// Message to be returned
		// 	let message = err.message
		// 	if (errors.isServerError(err)) {
		// 		// For Server Errors we just send a standard message.
		// 		// This is to avoid sending internal information about our system.
		// 		message = 'Internal Server Error'
		// 	}

		// 	// We finally reply with the error message
		// 	res.status(err.statusCode).json({
		// 		errors: [
		// 			{
		// 				id: err.id,
		// 				message,
		// 				code: err.getErrorCode(),
		// 			},
		// 		],
		// 		data: {},
		// 		meta: {},
		// 	})

		// 	// For server errors, we call next(err) to delegate to the default error
		// 	// handling mechanisms in Express
		// 	if (errors.isServerError(err) && !err.testError) return next(err)
		// })

		// In testing we don't actually need the http server
		// to start in order to test the app
		if (!env.isTesting) {
			await this.server.start({ logger: expressApplicationLogger.logger })
		}

		return { app: this.app, serverLogger: expressApplicationLogger }
	}

	stop() {
		if (env.isTesting) return
		if (this.server) return this.server.stop()
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = Server
