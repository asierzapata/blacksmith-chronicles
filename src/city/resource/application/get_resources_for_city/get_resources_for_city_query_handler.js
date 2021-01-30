const { Query } = require('shared_kernel/buses/command_query')
const { ResourceResponse } = require('city/resource/application/resource_response')

const {
	getResourcesForCityUseCase,
} = require('city/resource/application/get_resources_for_city/get_resources_for_city_use_case')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Session } = require('city/shared/session/session')
const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                          Query                         */
/* ====================================================== */

class GetResourcesForCity extends Query {
	static get type() {
		return 'city.1.query.resource.get_resources_for_city'
	}

	static create({ cityId, session }) {
		return new this({
			type: this.type,
			attributes: { cityId },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleGetResourcesForCity(query, dependencies) {
	const cityId = new Id(query.getAttributes().cityId)
	const session = new Session(query.getMetadata().session)

	try {
		const resources = await getResourcesForCityUseCase({ cityId, session }, dependencies)
		return ResourceResponse.dataResponse({ resources })
	} catch (err) {
		return ResourceResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	GetResourcesForCity,
	handleGetResourcesForCity,
}
