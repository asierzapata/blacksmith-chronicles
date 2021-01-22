const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class ResourcesAlreadyCreatedForCityError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.resources_already_created_for_city'
	}

	static create({
		message = 'Resources Already Created For City',
		code = 'resources-already-created-for-city',
	} = {}) {
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

module.exports = { ResourcesAlreadyCreatedForCityError }
