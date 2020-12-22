const { checkString } = require('city_api/utils/input_validators')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { RelocateCityCommand } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

async function relocateCity(req, res, next) {
	try {
		const cityResponse = await req.commandBus.handle(
			RelocateCityCommand.create({
				cityId: checkString(req.params.cityId),
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
		// // TODO: Ask santi about error switching with constructor and error code
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

module.exports = { relocateCity }
