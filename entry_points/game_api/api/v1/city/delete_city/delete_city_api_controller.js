const _ = require('lodash')

const { checkString } = require('game_api/utils/input_validators')
const {
	InvalidInputStringError,
} = require('game_api/utils/input_validators/errors/invalid_input_string_error')

const { successReponse, errorReponse } = require('game_api/utils/responses_factory')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { DeleteCityCommand } = require('city/city')
const { CityNotFoundError } = require('city/city/domain/errors/city_not_found_error')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const ERROR_STATUS_MAPPING = {
	[CityNotFoundError.name]: 404,
	[InvalidInputStringError.name]: 400,
}

async function deleteCity(req, res, next) {
	try {
		const response = await req.commandBus.handle(
			DeleteCityCommand.create({
				cityId: checkString(req.params.cityId),
				session: req.session,
			})
		)
		if (!_.isEmpty(response.errors)) {
			return errorReponse({
				res,
				errors: response.errors,
				errorsStatusMapping: ERROR_STATUS_MAPPING,
			})
		}
		return successReponse({
			res,
			statusCode: 200,
			data: {},
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

module.exports = { deleteCity }
