/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { CreateCityCommand } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

async function createCity(req, res, next) {
	try {
		const cityResponse = await req.commandBus.handle(
			CreateCityCommand.create({
				cityId: req.body.cityId,
				userId: 'b854a860-85c0-40a3-abbe-3c9684138891', // req.session.distinctId,
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

module.exports = { createCity }
