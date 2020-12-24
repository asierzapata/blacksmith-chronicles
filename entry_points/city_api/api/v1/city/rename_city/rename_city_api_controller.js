const _ = require('lodash')
const { checkString } = require('city_api/utils/input_validators')

/* ====================================================== */
/*                        Module                          */
/* ====================================================== */

const { RenameCityCommand } = require('city/city')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

async function renameCity(req, res, next) {
	const cityResponse = await req.commandBus.handle(
		RenameCityCommand.create({
			cityId: checkString(req.params.cityId),
			name: checkString(req.body.name),
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
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { renameCity }
