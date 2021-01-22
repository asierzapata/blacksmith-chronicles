/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const {
	ResourceNotFoundError,
} = require('city/resource/domain/errors/resource_not_found_error')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function updateRateUseCase({ resourceId, rate }, { resourceRepository, eventBus }) {
	const [resource] = await resourceRepository.findByIds([resourceId])

	if (!resource) {
		throw ResourceNotFoundError.create()
	}

	await resource.updateRate({ rate })
	await resourceRepository.save(resource)

	const events = resource.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return resource
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { updateRateUseCase }
