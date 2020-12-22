const {
	checkString,
	invalidInputStringError,
} = require('city_api/utils/input_validators')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { GetCitiesQuery } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

async function getCityById(req, res, next) {
	try {
		const cityResponse = await req.queryBus.handle(
			GetCitiesQuery.create({
				cityIds: [checkString(req.params.cityId)],
				session: req.session,
			})
		)
		return res.status(201).json({
			data: {
				cities: cityResponse.data.cities,
			},
			meta: {},
		})
	} catch (err) {
		return next(err)
		// if (!err.getErrorCode) return next(err)

		// const errorCode = err.getErrorCode()
		// switch (errorCode) {
		// 	case invalidInputStringError().getErrorCode():
		// 		return next(errors.badRequest(err))
		// 	default:
		// 		return next(errors.internalServer(err))
		// }
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { getCityById }
