const _ = require('lodash')

const { successReponse, errorReponse } = require('game_api/utils/responses_factory')
const { checkString } = require('game_api/utils/input_validators')
const {
	InvalidInputStringError,
} = require('game_api/utils/input_validators/errors/invalid_input_string_error')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { CreateCityCommand } = require('city/city')
const {
	CityAlreadyExistsError,
} = require('city/city/domain/errors/city_already_exists_error')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const ERROR_STATUS_MAPPING = {
	[CityAlreadyExistsError.name]: 409,
	[InvalidInputStringError.name]: 400,
}

async function createCity(req, res, next) {
	try {
		const cityResponse = await req.commandBus.handle(
			CreateCityCommand.create({
				cityId: checkString(req.body.cityId),
				userId: req.session.distinctId,
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
			statusCode: 201,
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

module.exports = { createCity }
