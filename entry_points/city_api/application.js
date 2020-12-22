const containerFactory = require('shared_kernel/container_factory')
const Database = require('city/shared/infrastructure/persistence/mongodb/db')

const envVars = require('city/shared/env')
const { Session } = require('city/shared/session/session')

const { Logger, LOGGER_SOURCES } = require('city_api/services/logger')

// Buses
// -----

const {
	errorBusMiddleware,
} = require('city/shared/buses/middlewares/error_bus_middleware')
const {
	queryOrCommandLoggingBusMiddleware,
	eventHandlerLoggingBusMiddleware,
} = require('city/shared/buses/middlewares/logging_bus_middleware')

// Modules
// -------

const cityModule = require('city/city')

const modules = [cityModule]

const Server = require('city_api/server')
const { AuthenticationService } = require('city_api/services/authentication')
const { GeolocationService } = require('city_api/services/geolocation')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Application {
	constructor() {
		this.server = new Server()
		this.geolocationService = new GeolocationService({
			envVars,
			secretKey: '',
			userAgent: '',
			cache: {},
		})
		this.authenticationService = new AuthenticationService({
			secret: envVars.jwt.auth.secret,
			algorithm: envVars.jwt.auth.algorithm,
			expiration: envVars.jwt.auth.expiration,
			cookieName: envVars.jwt.auth.cookieName,
		})
	}

	async start() {
		try {
			// const databaseConnection = new Database({
			// 	url: envVars.mongo.url,
			// 	name: envVars.mongo.databaseName,
			// 	logger: new Logger({
			// 		name: LOGGER_SOURCES.MONGO_DB,
			// 		enabled: !envVars.isTesting && envVars.logging.enabled,
			// 		level: envVars.logging.level,
			// 		prettyPrint: envVars.isDevelopment,
			// 	}),
			// })
			// const { db } = await databaseConnection.connect()

			const logger = new Logger({
				name: LOGGER_SOURCES.APPLICATION,
				enabled: !envVars.isTesting && envVars.logging.enabled,
				level: envVars.logging.level,
				prettyPrint: envVars.isDevelopment,
			})

			const middlewares = {
				commandBus: [queryOrCommandLoggingBusMiddleware, errorBusMiddleware],
				queryBus: [queryOrCommandLoggingBusMiddleware, errorBusMiddleware],
				eventBus: [eventHandlerLoggingBusMiddleware, errorBusMiddleware],
			}

			const onDestroy = () => {
				// databaseConnection.disconnect()
			}

			const {
				commandBus,
				queryBus,
				eventBus,
				destroy,
				register,
				unregister,
				resolve,
			} = await containerFactory.createContainer({
				modules,
				middlewares,
				// db,
				logger,
				envVars,
				sessionValueObject: Session,
				onDestroy,
			})

			this.destroy = destroy

			const { app, serverLogger } = await this.server.start({
				commandBus,
				queryBus,
				eventBus,
				geolocationService: this.geolocationService,
				authenticationService: this.authenticationService,
			})

			serverLogger.info('Application Started!')
			return {
				app,
				serverLogger,
				commandBus,
				queryBus,
				eventBus,
				register,
				unregister,
				resolve,
				destroy,
			}
		} catch (err) {
			console.error('Application Failed to start!', err)
			throw err
		}
	}

	async stop() {
		this.server.stop()
		await this.destroy()
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = Application
