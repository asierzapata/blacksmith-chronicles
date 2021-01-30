/* ====================================================== */
/*                     Dependencies                       */
/* ====================================================== */

const {
	DynamoDBCityRepository,
} = require('city/city/infrastructure/repositories/dynamodb_city_repository')

/* ====================================================== */
/*                        Events                          */
/* ====================================================== */

const { CityCreatedEvent } = require('city/city/domain/events/city_created_event')
const { CityDeletedEvent } = require('city/city/domain/events/city_deleted_event')
const { CityRenamedEvent } = require('city/city/domain/events/city_renamed_event')
const { CityRelocatedEvent } = require('city/city/domain/events/city_relocated_event')

/* ====================================================== */
/*                       Handlers                         */
/* ====================================================== */

// Command Handlers
// ----------------

const {
	CreateCityCommand,
	handleCreateCityCommand,
} = require('city/city/application/create_city/create_city_command_handler')
const {
	DeleteCityCommand,
	handleDeleteCityCommand,
} = require('city/city/application/delete_city/delete_city_command_handler')
const {
	RelocateCityCommand,
	handleRelocateCityCommand,
} = require('city/city/application/relocate_city/relocate_city_command_handler')
const {
	RenameCityCommand,
	handleRenameCityCommand,
} = require('city/city/application/rename_city/rename_city_command_handler')

// Query Handlers
// --------------

const {
	GetCitiesQuery,
	handleGetCitiesQuery,
} = require('city/city/application/get_cities/get_cities_query_handler')
const {
	GetCitiesByUserIdQuery,
	handleGetCitiesByUserIdQuery,
} = require('city/city/application/get_cities_by_user_id/get_cities_by_user_id_query_handler')

// Event Handlers
// --------------

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	name: 'city',
	// Handlers
	eventHandlers: {},
	commandHandlers: {
		[CreateCityCommand.type]: handleCreateCityCommand,
		[DeleteCityCommand.type]: handleDeleteCityCommand,
		[RenameCityCommand.type]: handleRenameCityCommand,
		[RelocateCityCommand.type]: handleRelocateCityCommand,
	},
	queryHandlers: {
		[GetCitiesQuery.type]: handleGetCitiesQuery,
		[GetCitiesByUserIdQuery.type]: handleGetCitiesByUserIdQuery,
	},
	// Dependencies
	getDependencyResolver,
	// Queries
	GetCitiesQuery,
	GetCitiesByUserIdQuery,
	// Commands
	CreateCityCommand,
	DeleteCityCommand,
	RenameCityCommand,
	RelocateCityCommand,
	// Events
	CityCreatedEvent,
	CityDeletedEvent,
	CityRelocatedEvent,
	CityRenamedEvent,
}

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

function getDependencyResolver({ db, envVars }) {
	return () => ({
		cityRepository: new DynamoDBCityRepository({ db, envVars }),
	})
}
