const { Command } = require('shared_kernel/buses/command_query')

const {
	relocateCityUseCase,
} = require('city/city/application/relocate_city/relocate_city_use_case')

const { CityResponse } = require('city/city/application/city_response')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { CityLocation } = require('city/city/domain/value_objects/city_location')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

class RelocateCityCommand extends Command {
	static get type() {
		return 'city.1.command.city.relocate_city'
	}

	static create({ cityId, location, session }) {
		return new this({
			type: this.type,
			attributes: { cityId, location },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleRelocateCityCommand(command, dependencies) {
	const cityId = new Id(command.getAttributes().cityId)
	const location = new CityLocation(command.getAttributes().location)

	try {
		const city = await relocateCityUseCase({ cityId, location }, dependencies)
		return CityResponse.dataResponse({ cities: [city] })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	RelocateCityCommand,
	handleRelocateCityCommand,
}
