const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class CityNotFoundError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.city_not_found'
	}

	static create({ message = 'City not found', code = 'city-not-found' } = {}) {
		return this.Operational({
			name: this.name,
			message,
			code,
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { CityNotFoundError }
