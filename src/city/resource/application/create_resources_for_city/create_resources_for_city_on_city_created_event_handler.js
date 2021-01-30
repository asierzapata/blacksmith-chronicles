const createResourcesForCityUseCase = require('city/resource/application/create_resources_for_city/create_resources_for_city_use_case')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Session } = require('city/shared/session/session')
const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function createResourcesForCityOnCityCreatedEventHandler(event, dependencies) {
	const session = new Session(event.getMetadata().session)
	const cityId = new Id(event.getAttributes().id)

	await createResourcesForCityUseCase({ cityId, session }, dependencies)

	return
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	createResourcesForCityOnCityCreatedEventHandler,
}
