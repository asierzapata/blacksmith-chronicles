const envVars = require('shared_kernel/env')
const _ = require('lodash')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	errorReponse,
	successReponse,
}

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

function errorReponse({ res, errors, errorsStatusMapping = {}, meta = {} }) {
	const firstErrorName = _.first(errors).name
	const status = _.get(errorsStatusMapping, `${firstErrorName}`, 500)
	const parsedErrors = _.map(errors, (error) => {
		if (envVars.isDevelopment) return error

		const parsedError = {
			...error,
			attributes: {
				code: error.attributes.code,
				message: error.attributes.message,
			},
		}
		return parsedError
	})

	return res.status(status).json({
		errors: [...parsedErrors],
		meta,
	})
}

function successReponse({ res, statusCode, data = {}, meta = {} }) {
	return res.status(statusCode).json({
		data,
		meta,
	})
}
