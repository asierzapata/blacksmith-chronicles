const _ = require('lodash')

const { checkString } = require('game_api/utils/input_validators')
const {
	InvalidInputStringError,
} = require('game_api/utils/input_validators/errors/invalid_input_string_error')

const { errorReponse, successReponse } = require('game_api/utils/responses_factory')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { RenameCityCommand } = require('city/city')
const { CityNotFoundError } = require('city/city/domain/errors/city_not_found_error')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const ERROR_STATUS_MAPPING = {
	[CityNotFoundError.name]: 404,
	[InvalidInputStringError.name]: 400,
}

async function renameCity(req, res, next) {
	try {
		const cityResponse = await req.commandBus.handle(
			RenameCityCommand.create({
				cityId: checkString(req.params.cityId),
				name: checkString(req.body.name),
				session: req.session,
			})
		)
		if (!_.isEmpty(cityResponse.errors)) {
			return errorReponse({
				res,
				errors: cityResponse.errors,
				errorsStatusMapping: ERROR_STATUS_MAPPING,
			})
		}
		return successReponse({
			res,
			statusCode: 200,
			data: { cities: cityResponse.data.cities },
		})
	} catch (error) {
		if (error.toValue) {
			return errorReponse({
				res,
				errors: [error],
				errorsStatusMapping: ERROR_STATUS_MAPPING,
			})
		}
		return next(error)
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { renameCity }
