const _ = require('lodash')

const { checkString } = require('game_api/utils/input_validators')
const {
	InvalidInputStringError,
} = require('game_api/utils/input_validators/errors/invalid_input_string_error')

const { errorReponse, successReponse } = require('game_api/utils/responses_factory')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { GetCitiesQuery } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const ERROR_STATUS_MAPPING = {
	[InvalidInputStringError.name]: 400,
}

async function getCityById(req, res, next) {
	try {
		const cityResponse = await req.queryBus.handle(
			GetCitiesQuery.create({
				cityIds: [checkString(req.params.cityId)],
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
			data: {
				cities: cityResponse.data.cities,
			},
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

module.exports = { getCityById }
