/* ====================================================== */
/*                     Dependencies                       */
/* ====================================================== */

const {
	DynamoDBResourceRepository,
} = require('city/resource/infrastructure/repositories/dynamodb_resource_repository')

/* ====================================================== */
/*                        Events                          */
/* ====================================================== */

const { CityCreatedEvent, CityDeletedEvent } = require('city/city')

const {
	ResourceCreatedEvent,
} = require('city/resource/domain/events/resource_created_event')
const {
	ResourceDeletedEvent,
} = require('city/resource/domain/events/resource_deleted_event')
const {
	ResourceRateUpdatedEvent,
} = require('city/resource/domain/events/resource_rate_updated_event')
const {
	ResourceValueUpdatedEvent,
} = require('city/resource/domain/events/resource_value_updated_event')

/* ====================================================== */
/*                       Handlers                         */
/* ====================================================== */

// Command Handlers
// ----------------

// Query Handlers
// --------------

const {
	GetResourcesForCityQuery,
	handleGetResourcesForCityQuery,
} = require('city/resource/application/get_resources_for_city/get_resources_for_city_query_handler')

// Event Handlers
// --------------

const {
	createResourcesForCityOnCityCreatedEventHandler,
} = require('city/resource/application/create_resources_for_city/create_resources_for_city_on_city_created_event_handler')
const {
	deleteResourcesForCityOnCityDeletedEventHandler,
} = require('city/resource/application/delete_resources_for_city/delete_resources_for_city_on_city_deleted_event_handler')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	name: 'resource',
	// Handlers
	eventHandlers: {
		[CityCreatedEvent.type]: createResourcesForCityOnCityCreatedEventHandler,
		[CityDeletedEvent.type]: deleteResourcesForCityOnCityDeletedEventHandler,
	},
	commandHandlers: {},
	queryHandlers: {
		[GetResourcesForCityQuery.type]: handleGetResourcesForCityQuery,
	},
	// Dependencies
	getDependencyResolver,
	// Queries
	// Commands
	// Events
	ResourceCreatedEvent,
	ResourceDeletedEvent,
	ResourceRateUpdatedEvent,
	ResourceValueUpdatedEvent,
}

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

function getDependencyResolver({ db, envVars }) {
	return () => ({
		resourceRepository: new DynamoDBResourceRepository({ db, envVars }),
	})
}
