const { checkString } = require('city_api/utils/input_validators')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { DeleteCityCommand } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

async function deleteCity(req, res, next) {
	try {
		await req.commandBus.handle(
			DeleteCityCommand.create({
				cityId: checkString(req.params.cityId),
				session: req.session,
			})
		)
		return res.status(201).json({
			data: {},
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

module.exports = { deleteCity }
