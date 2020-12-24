const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class CityAlreadyExistsError extends ApplicationError {
	static get name() {
		return 'city.1.error.city_already_exists'
	}

	static create({ message = 'City already exists', code = 'city-already-exists' } = {}) {
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

module.exports = { CityAlreadyExistsError }
