const { Command } = require('shared_kernel/buses/command_query')

const {
	deleteCityUseCase,
} = require('city/city/application/delete_city/delete_city_use_case')

const { CityResponse } = require('city/city/application/city_response')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

class DeleteCityCommand extends Command {
	static get type() {
		return 'city.1.command.city.delete_city'
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

async function handleDeleteCityCommand(command, dependencies) {
	const cityId = new Id(command.getAttributes().cityId)
	try {
		const city = await deleteCityUseCase({ cityId }, dependencies)
		return CityResponse.dataResponse({ cities: [city] })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	DeleteCityCommand,
	handleDeleteCityCommand,
}
