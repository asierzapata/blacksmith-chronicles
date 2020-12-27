// const dynamo = require('dynamodb')
const aws = require('aws-sdk')
const containerFactory = require('shared_kernel/container_factory')

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
const {
	ElasticSearch,
} = require('shared_kernel/infrastructure/persistence/elastic_search')
const {
	ElasticSearchBusMessagesStore,
} = require('shared_kernel/infrastructure/persistence/bus_messages_store/elastic_search_bus_messages_store')

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
			const dynamodb = new aws.DynamoDB({
				accessKeyId: envVars.aws.dynamodb.accessKey,
				secretAccessKey: envVars.aws.dynamodb.secretAccessKey,
				apiVersion: '2012-08-10',
				region: 'eu-west-2',
			})
			const db = new aws.DynamoDB.DocumentClient({
				service: dynamodb,
			})

			let busMessagesStore = null
			if (envVars.isProduction) {
				const elasticSearchInstance = new ElasticSearch({
					nodeUrl: envVars.aws.elasticSearch.nodeUrl,
					auth: {
						apiKey: envVars.aws.elasticSearch.apiKey,
					},
				})
				const { elasticSearch } = await elasticSearchInstance.connect()

				busMessagesStore = new ElasticSearchBusMessagesStore({ elasticSearch })
			}

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
				db,
				busMessagesStore,
				logger,
				envVars,
				sessionValueObject: Session,
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
