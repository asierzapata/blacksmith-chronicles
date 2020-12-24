const _ = require('lodash')
const { checkString, checkNumber } = require('city_api/utils/input_validators')

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
				location: {
					x: checkNumber(req.body.location.x),
					y: checkNumber(req.body.location.y),
				},
				session: req.session,
			})
		)
		if (!_.isEmpty(cityResponse.data.errors)) {
			return res.status(500).json({
				errors: [...cityResponse.data.errors],
				meta: {},
			})
		}
		return res.status(201).json({
			data: {
				cities: cityResponse.data.cities,
			},
			meta: {},
		})
	} catch (err) {
		next(err)
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { relocateCity }
