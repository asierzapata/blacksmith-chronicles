/* ====================================================== */
/*                     Dependencies                       */
/* ====================================================== */

const {
	MemoryCityRepository,
} = require('city/city/infrastructure/repositories/memory_city_repository')

/* ====================================================== */
/*                        Events                          */
/* ====================================================== */

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
const {
	DynamoDBCityRepository,
} = require('./infrastructure/repositories/dynamodb_city_repository')

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
}

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

function getDependencyResolver({ db, envVars }) {
	return () => ({
		cityRepository: new DynamoDBCityRepository({ db, envVars }),
	})
}
