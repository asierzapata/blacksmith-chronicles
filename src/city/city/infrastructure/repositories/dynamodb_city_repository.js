const assert = require('assert')
const _ = require('lodash')

const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { Timestamp } = require('shared_kernel/value_objects/timestamp')
const { City } = require('city/city/domain/aggregate/city_aggregate')
const { CityName } = require('city/city/domain/value_objects/city_name')
const { CityLocation } = require('city/city/domain/value_objects/city_location')

/* ====================================================== */
/*                        Mapping                         */
/* ====================================================== */

const ENTITY_FIELDS_TO_DATABASE_MAPPING = {
	id: 'id',
	userId: 'userId',
	name: 'name',
	location: 'location',
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
}

const DATABASE_VALID_QUERY_FIELDS = {
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]: false,
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.userId]: true,
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.name]: true,
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.location]: true,
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt]: true,
	[ENTITY_FIELDS_TO_DATABASE_MAPPING.updatedAt]: true,
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class DynamoDBCityRepository {
	constructor({ db, env }) {
		assert(db, 'City DynamoDB Repository - Missing db')
		this.env = env
		this.db = db
		this.table = 'cities'
	}

	// Read
	// ----

	async findByIds(cityIds) {
		const cityIdsValues = _.map(cityIds, (cityId) => cityId.toValue())

		const query = {
			RequestItems: {
				[this.table]: {
					Keys: _.map(cityIdsValues, (cityId) => ({ id: cityId })),
				},
			},
		}
		const { Responses } = await this.db.batchGet(query).promise()
		const result = Responses[this.table]

		return toEntities(_.values(result))
	}

	async findByUserId(userId) {
		const userIdValue = userId.toValue()

		const query = {
			TableName: this.table,
			IndexName: 'userId',
			KeyConditionExpression: 'userId = :userId',
			ExpressionAttributeValues: {
				':userId': userIdValue,
			},
		}

		const response = await this.db.query(query).promise()
		const result = response.Items
		return toEntities(_.values(result))
	}

	// Write
	// -----

	async save(city) {
		const cityDatabase = toDatabase(city)

		const changedCityAttributes = city.changedAttributes()

		const filteredUpdatedAttributes = {}
		_.forEach(changedCityAttributes, (hasChanged, attributeKey) => {
			if (hasChanged) {
				const queryKey = ENTITY_FIELDS_TO_DATABASE_MAPPING[attributeKey]
				if (DATABASE_VALID_QUERY_FIELDS[queryKey]) {
					filteredUpdatedAttributes[queryKey] = cityDatabase[queryKey]
				}
			}
		})

		const query = {
			TableName: this.table,
			Key: {
				[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]:
					cityDatabase[ENTITY_FIELDS_TO_DATABASE_MAPPING.id],
			},
			AttributeUpdates: _.reduce(
				filteredUpdatedAttributes,
				(result, value, key) => {
					return {
						...result,
						[key]: {
							ACTION: 'PUT',
							Value: value,
						},
					}
				},
				{}
			),
		}
		await this.db.update(query).promise()

		return city
	}

	async remove(city) {
		const cityDatabase = toDatabase(city)
		const query = {
			TableName: this.table,
			Key: {
				[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]:
					cityDatabase[ENTITY_FIELDS_TO_DATABASE_MAPPING.id],
			},
		}

		await this.db.delete(query).promise()
		return city
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { DynamoDBCityRepository }

/* ====================================================== */
/*                      Data Mapper                       */
/* ====================================================== */

class CityDataMapperError extends ApplicationError {
	static get name() {
		return 'city.1.error.city.city_data_mapper'
	}

	static create({
		message = 'Error mapping DB values',
		code = 'city-repository',
		error,
	} = {}) {
		return this.Operational({
			name: this.name,
			message,
			code,
			error,
		})
	}
}

function toEntity(data) {
	if (_.isEmpty(data)) return
	try {
		return new City(
			{
				id: new Id(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]),
				userId: new Id(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.userId]),
				name: new CityName(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.name]),
				location: new CityLocation(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.location]),
				updatedAt: new Timestamp(
					new Date(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.updatedAt])
				),
				createdAt: new Timestamp(
					new Date(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt])
				),
			},
			{ isNew: false }
		)
	} catch (err) {
		throw CityDataMapperError.create(err)
	}
}

function toEntities(data = []) {
	if (_.isEmpty(data)) return []
	return _.map(data, toEntity)
}

function toDatabase(city) {
	if (_.isEmpty(city)) return
	return {
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]: city.getId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.userId]: city.getUserId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.name]: city.getName().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.location]: city.getLocation().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt]: city.getCreatedAt().toISOString(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.updatedAt]: city.getUpdatedAt().toISOString(),
	}
}
