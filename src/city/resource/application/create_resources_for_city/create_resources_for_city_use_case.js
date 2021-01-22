const _ = require('lodash')

/* ====================================================== */
/*                        Domain                          */
/* ====================================================== */

const { Resource } = require('city/resource/domain/aggregate/resource_aggregate')

const { ResourceType } = require('city/resource/domain/value_objects/resource_type')

const {
	ResourcesAlreadyCreatedForCityError,
} = require('city/resource/domain/errors/resources_already_created_for_city_error')

/* ====================================================== */
/*                        Query                           */
/* ====================================================== */

async function createResourcesForCityUseCase(
	{ cityId },
	{ resourceRepository, eventBus }
) {
	const existingResources = resourceRepository.getResourcesByCityId(cityId)
	if (!_.isEmpty(existingResources)) {
		throw ResourcesAlreadyCreatedForCityError.create()
	}

	const initialResources = generateInitialResourcesDataForCity()

	let resources = _.map(initialResources, ({ value, type, rate }) => {
		return Resource.create({ cityId, value, type, rate })
	})

	resources = _.map(resources, (resource) => resourceRepository.save(resource))

	const events = _.flatMap(resources, (resource) => resource.pullDomainEvents())
	await eventBus.publish(events, { sync: false })

	return resources
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { createResourcesForCityUseCase }

/* ====================================================== */
/*                       Helpers                          */
/* ====================================================== */

function generateInitialResourcesDataForCity() {
	const resourceTypes = [
		_.values(ResourceType.baseTypes),
		ResourceType.randomSpecialType(),
	]

	const resourceData = _.map(resourceTypes, (resourceType) => {
		return {
			value: 1500,
			type: resourceType,
			rate: 0,
		}
	})

	return resourceData
}
