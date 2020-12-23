const { Query } = require('shared_kernel/buses/command_query')
const { CityResponse } = require('city/city/application/city_response')

const {
	getCitiesByUserIdUseCase,
} = require('city/city/application/get_cities_by_user_id/get_cities_by_user_id_use_case')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Session } = require('city/shared/session/session')
const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                          Query                         */
/* ====================================================== */

class GetCitiesByUserIdQuery extends Query {
	static get type() {
		return 'city.1.query.city.get_cities_by_user_id'
	}

	static create({ userId, session }) {
		return new this({
			type: this.type,
			attributes: { userId },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleGetCitiesByUserIdQuery(query, dependencies) {
	const userId = new Id(query.getAttributes().userId)
	const session = new Session(query.getMetadata().session)

	try {
		const cities = await getCitiesByUserIdUseCase({ userId, session }, dependencies)
		return CityResponse.dataResponse({ cities })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	GetCitiesByUserIdQuery,
	handleGetCitiesByUserIdQuery,
}
