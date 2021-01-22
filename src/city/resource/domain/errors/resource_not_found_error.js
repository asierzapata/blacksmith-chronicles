const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class ResourceNotFoundError extends ApplicationError {
	static get name() {
		return 'city.1.error.resource.resource_not_found'
	}

	static create({ message = 'Resource not found', code = 'resource-not-found' } = {}) {
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

module.exports = { ResourceNotFoundError }
