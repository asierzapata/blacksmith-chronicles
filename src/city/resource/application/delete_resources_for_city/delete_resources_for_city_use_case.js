const _ = require('lodash')

/* ====================================================== */
/*                        Domain                          */
/* ====================================================== */

const {
	ResourcesAlreadyDeletedForCityError,
} = require('city/resource/domain/errors/resources_already_deleted_for_city_error')

/* ====================================================== */
/*                        Query                           */
/* ====================================================== */

async function deleteResourcesForCityUseCase(
	{ cityId },
	{ resourceRepository, eventBus }
) {
	const resources = resourceRepository.getResourcesByCityId(cityId)
	if (_.isEmpty(resources)) {
		throw ResourcesAlreadyDeletedForCityError.create()
	}

	_.forEach(resources, (resource) => {
		return resource.delete()
	})

	const removePromises = _.map(resources, (resource) =>
		resourceRepository.remove(resource)
	)

	await Promise.all(removePromises)

	const events = _.flatMap(resources, (resource) => resource.pullDomainEvents())
	await eventBus.publish(events, { sync: false })

	return resources
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { deleteResourcesForCityUseCase }
