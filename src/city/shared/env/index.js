const Joi = require('joi')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

const envVarsSchema = Joi.object({
	NODE_ENV: Joi.string()
		.allow('production', 'staging', 'development', 'testing')
		.required(),
	PORT: Joi.number().required(),
	ENABLE_APM: Joi.boolean().required(),

	// LOGGING
	LOGGING_ENABLED: Joi.boolean().required(),
	LOGGING_LEVEL: Joi.string()
		.allow('info', 'fatal', 'error', 'warn', 'info', 'debug')
		.required(),

	// AUTHENTICATION
	JWT_ALGORITHM: Joi.string().required(),
	JWT_EXPIRATION: Joi.string().required(),
	JWT_SECRET: Joi.string().required(),
	JWT_COOKIE_NAME: Joi.string().required(),

	// DYNAMODB
	AWS_DYNAMODB_ACCESS_KEY: Joi.string().required(),
	AWS_DYNAMODB_SECRET_ACCESS_KEY: Joi.string().required(),

	// ELASTIC SEARCH
	AWS_ELASTIC_SEARCH_NODE_URL: Joi.string().required(),
	AWS_ELASTIC_SEARCH_API_KEY: Joi.string().required(),
})

const { error, value: envVars } = envVarsSchema.validate(process.env, {
	allowUnknown: true,
})

if (error) {
	console.error(`Config ${process.env.NODE_ENV} validation error: ${error.message}`)
	throw new Error(
		`(NODE_ENV=${process.env.NODE_ENV}) Config validation error: ${error.message}`
	)
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	NODE_ENV: envVars.NODE_ENV,
	PORT: envVars.PORT,
	ENABLE_APM: envVars.ENABLE_APM,
	isProduction: envVars.NODE_ENV === 'production',
	isStaging: envVars.NODE_ENV === 'staging',
	isDevelopment: envVars.NODE_ENV === 'development',
	isTesting: envVars.NODE_ENV === 'testing',
	logging: {
		enabled: envVars.LOGGING_ENABLED,
		level: envVars.LOGGING_LEVEL,
	},
	jwt: {
		auth: {
			algorithm: envVars.JWT_ALGORITHM,
			expiration: envVars.JWT_EXPIRATION,
			secret: envVars.JWT_SECRET,
			cookieName: envVars.JWT_COOKIE_NAME,
		},
	},
	aws: {
		dynamodb: {
			accessKey: envVars.AWS_DYNAMODB_ACCESS_KEY,
			secretAccessKey: envVars.AWS_DYNAMODB_SECRET_ACCESS_KEY,
		},
		elasticSearch: {
			nodeUrl: envVars.AWS_ELASTIC_SEARCH_NODE_URL,
			apiKey: envVars.AWS_ELASTIC_SEARCH_API_KEY,
		},
	},
}
