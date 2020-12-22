const _ = require('lodash')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { NullableTimestamp } = require('shared_kernel/value_objects/nullable_timestamp')
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

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class MemoryCityRepository {
	constructor() {
		this._data = {}
	}

	// Read
	// ----

	async findByIds(cityIds) {
		const cityIdsValues = _.map(cityIds, (cityId) => cityId.toValue())
		const result = _.filter(this._data, (city) => _.includes(cityIdsValues, city.id))
		return toEntities(_.values(result))
	}

	async findByUserId(userId) {
		const userIdValue = userId.toValue()
		const result = _.filter(this._data, (city) => userIdValue === city.userId)
		return toEntities(_.values(result))
	}

	// Write
	// -----

	async save(city) {
		const id = city.getId().toValue()

		const cityDatabase = toDatabase(city)

		const changedCityAttributes = city.changedAttributes()
		const query = {}
		_.forEach(changedCityAttributes, (hasChanged, attributeKey) => {
			if (hasChanged) {
				const queryKey = ENTITY_FIELDS_TO_DATABASE_MAPPING[attributeKey]
				query[queryKey] = cityDatabase[queryKey]
			}
		})

		const updatedValue = { ...this._data[id], ...query }
		this._data[id] = updatedValue

		return city
	}

	async remove(city) {
		this._data = _.omit(this._data, city.getId().toValue())
	}

	async removeAll() {
		this._data = {}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { MemoryCityRepository }

/* ====================================================== */
/*                      Data Mapper                       */
/* ====================================================== */

function cityDataMapperError() {
	// return errors.databaseValidation({
	// 	errorCode: 'city-data-mapping-error',
	// 	data: value,
	// 	message,
	// })
}

function toEntity(data) {
	if (_.isEmpty(data)) return
	try {
		return new City(
			{
				id: new Id(data._id),
				userId: new Id(data.userId),
				name: new CityName(data.name),
				location: new CityLocation(data.location),
				createdAt: data.createdAt
					? new NullableTimestamp(data.createdAt)
					: NullableTimestamp.never(),
				updatedAt: data.updatedAt
					? new NullableTimestamp(data.updatedAt)
					: NullableTimestamp.never(),
			},
			{ isNew: false }
		)
	} catch (err) {
		throw cityDataMapperError(err)
	}
}

function toEntities(data = []) {
	if (_.isEmpty(data)) return []
	return _.map(data, (d, number) => toEntity({ ...d, number }))
}

function toDatabase(city) {
	if (_.isEmpty(city)) return

	return {
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]: city.getId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.userId]: city.getUserId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.name]: city.getName().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.location]: city.getLocation().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt]: city.getCreatedAt().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.updatedAt]: city.getUpdatedAt().toValue(),
	}
}
