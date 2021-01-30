const express = require('express')
const assert = require('assert')
const expressPinoLogger = require('express-pino-logger')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')

const env = require('shared_kernel/env')
const uuid = require('shared_kernel/uuid')
const HTTPServer = require('game_api/services/http_server')
const { Logger, LOGGER_SOURCES } = require('game_api/services/logger')

/* ====================================================== */
/*                      Middleware                        */
/* ====================================================== */

const authenticationMiddleware = require('game_api/middlewares/authentication')

/* ====================================================== */
/*                        Routes                          */
/* ====================================================== */

const health = require('game_api/health')
const api = require('game_api/api')
const { ApplicationError } = require('shared_kernel/errors/application_error')
const { errorReponse } = require('./utils/responses_factory')

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
			prettyPrint: env.isDevelopment,
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

		router.use('/health', health)
		router.use('/api', api)

		// Error Handling
		// --------------

		this.app.use(router)

		// eslint-disable-next-line no-unused-vars
		this.app.use((err, req, res, next) => {
			let error = err
			if (!error.toValue) {
				error = ApplicationError.Programmer({
					name: error.name,
					message: error.message,
					error,
				})
			}

			return errorReponse({ res, errors: [error] })
		})

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
