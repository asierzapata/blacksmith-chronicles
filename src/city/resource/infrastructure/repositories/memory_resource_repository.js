const _ = require('lodash')

const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { Resource } = require('city/resource/domain/aggregate/resource_aggregate')

const { Id } = require('shared_kernel/value_objects/id')
const { Timestamp } = require('shared_kernel/value_objects/timestamp')
const { ResourceValue } = require('city/resource/domain/value_objects/resource_value')
const { ResourceRate } = require('city/resource/domain/value_objects/resource_rate')
const { ResourceType } = require('city/resource/domain/value_objects/resource_type')

/* ====================================================== */
/*                        Mapping                         */
/* ====================================================== */

const ENTITY_FIELDS_TO_DATABASE_MAPPING = {
	id: 'id',
	cityId: 'cityId',
	value: 'value',
	rate: 'rate',
	type: 'type',
	createdAt: 'createdAt',
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class MemoryResourceRepository {
	constructor() {
		this._data = {}
	}

	// Read
	// ----

	async findByIds(resourceIds) {
		const resourceIdsValues = _.map(resourceIds, (resourceId) => resourceId.toValue())
		const result = _.filter(this._data, (resource) =>
			_.includes(resourceIdsValues, resource.id)
		)
		return toEntities(_.values(result))
	}

	async findByCityId(cityId) {
		const cityIdValue = cityId.toValue()
		const result = _.filter(this._data, (resource) => cityIdValue === resource.cityId)
		return toEntities(_.values(result))
	}

	// Write
	// -----

	async save(resource) {
		const id = resource.getId().toValue()

		const resourceDatabase = toDatabase(resource)

		const changedResourceAttributes = resource.changedAttributes()
		const query = { lastCorrectValueAt: Timestamp.now() }
		_.forEach(changedResourceAttributes, (hasChanged, attributeKey) => {
			if (hasChanged) {
				const queryKey = ENTITY_FIELDS_TO_DATABASE_MAPPING[attributeKey]
				query[queryKey] = resourceDatabase[queryKey]
			}
		})

		const updatedValue = { ...this._data[id], ...query }
		this._data[id] = updatedValue

		return resource
	}

	async remove(resource) {
		this._data = _.omit(this._data, resource.getId().toValue())
	}

	async removeAll() {
		this._data = {}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { MemoryResourceRepository }

/* ====================================================== */
/*                      Data Mapper                       */
/* ====================================================== */

class ResourceDataMapperError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.resource_data_mapper'
	}

	static create({
		message = 'Error mapping DB values',
		code = 'resource-repository',
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
		return new Resource(
			{
				id: new Id(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]),
				cityId: new Id(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.cityId]),
				value: new ResourceValue(
					getValueByRateAndLastCorrectValueAt({
						value: data[ENTITY_FIELDS_TO_DATABASE_MAPPING.value],
						rate: data[ENTITY_FIELDS_TO_DATABASE_MAPPING.rate],
						lastCorrectValueAt: data.lastCorrectValueAt,
					})
				),
				rate: new ResourceRate(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.rate]),
				type: new ResourceType(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.type]),
				createdAt: new Timestamp(
					new Date(data[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt])
				),
			},
			{ isNew: false }
		)
	} catch (err) {
		throw ResourceDataMapperError.create(err)
	}
}

function toEntities(data = []) {
	if (_.isEmpty(data)) return []
	return _.map(data, toEntity)
}

function toDatabase(resource) {
	if (_.isEmpty(resource)) return
	return {
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.id]: resource.getId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.cityId]: resource.getCityId().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.value]: resource.getValue().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.rate]: resource.getRate().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.type]: resource.getType().toValue(),
		[ENTITY_FIELDS_TO_DATABASE_MAPPING.createdAt]: resource.getCreatedAt().toValue(),
	}
}

/* ====================================================== */
/*                      Data Mapper                       */
/* ====================================================== */

function getValueByRateAndLastCorrectValueAt({ value, rate, lastCorrectValueAt }) {
	const resourceRate = new ResourceRate(rate)
	const lastCorrectValueAtTimestamp = new Timestamp(lastCorrectValueAt)
	const now = Timestamp.now()
	const timeDifference = now.differenceWith(lastCorrectValueAtTimestamp)
	const newValue =
		value + resourceRate.calculateValueWithTimePassed({ timePassed: timeDifference })
	return newValue
}
