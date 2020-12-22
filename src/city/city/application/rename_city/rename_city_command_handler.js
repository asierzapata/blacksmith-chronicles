const { Command } = require('shared_kernel/buses/command_query')

const {
	renameCityUseCase,
} = require('city/city/application/rename_city/rename_city_use_case')

const { CityResponse } = require('city/city/application/city_response')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Id } = require('shared_kernel/value_objects/id')
const { CityName } = require('city/city/domain/value_objects/city_name')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

class RenameCityCommand extends Command {
	static get type() {
		return 'city.1.command.city.rename_city'
	}

	static create({ cityId, name, session }) {
		return new this({
			type: this.type,
			attributes: { cityId, name },
			meta: { session },
		})
	}
}

/* ====================================================== */
/*                        Handler                         */
/* ====================================================== */

async function handleRenameCityCommand(command, dependencies) {
	const cityId = new Id(command.getAttributes().cityId)
	const name = new CityName(command.getAttributes().name)

	try {
		const city = await renameCityUseCase({ cityId, name }, dependencies)
		return CityResponse.dataResponse({ cities: [city] })
	} catch (err) {
		return CityResponse.errorResponse({ errors: [err] })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	RenameCityCommand,
	handleRenameCityCommand,
}
