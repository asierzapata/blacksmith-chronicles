const { Command } = require('shared_kernel/buses/command_query')

const {
	createCityUseCase,
} = require('city/city/application/create_city/create_city_use_case')

const { CityResponse } = require('city/city/application/city_response')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

class CreateCityCommand extends Command {
	static get type() {
		return 'city.1.command.city.create_city'
	}

	static create({ cityId, userId, session }) {
		return new this({
			type: this.type,
			attributes: { cityId, userId },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleCreateCityCommand(command, dependencies) {
	const cityId = new Id(command.getAttributes().cityId)
	const userId = new Id(command.getAttributes().userId)

	try {
		const city = await createCityUseCase({ cityId, userId }, dependencies)
		return CityResponse.dataResponse({ cities: [city] })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	CreateCityCommand,
	handleCreateCityCommand,
}
