const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class ResourcesAlreadyDeletedForCityError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.resources_already_deleted_for_city'
	}

	static create({
		message = 'Resources Already Deleted For City',
		code = 'resources-already-deleted-for-city',
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

module.exports = { ResourcesAlreadyDeletedForCityError }
