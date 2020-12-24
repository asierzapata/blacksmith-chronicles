const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class InvalidInputBooleanError extends ApplicationError {
	static get name() {
		return 'api.1.error.invalid_input_boolean'
	}

	static create({
		message = 'Invalid Input Boolean',
		code = 'invalid-input-boolean',
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

module.exports = { InvalidInputBooleanError }
