const _ = require('lodash')

const { Query } = require('shared_kernel/buses/command_query')
const { CityResponse } = require('city/city/application/city_response')

const {
	getCitiesUseCase,
} = require('city/city/application/get_cities/get_cities_use_case')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Session } = require('city/shared/session/session')
const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                          Query                         */
/* ====================================================== */

class GetCitiesQuery extends Query {
	static get type() {
		return 'city.1.query.get_cities'
	}

	static create({ cityIds, session }) {
		return new this({
			type: this.type,
			attributes: { cityIds },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleGetCitiesQuery(query, dependencies) {
	const cityIds = _.map(query.getAttributes().cityIds, (cityId) => new Id(cityId))
	const session = new Session(query.getMetadata().session)

	try {
		const cities = await getCitiesUseCase({ cityIds, session }, dependencies)
		return CityResponse.dataResponse({ cities })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	GetCitiesQuery,
	handleGetCitiesQuery,
}
