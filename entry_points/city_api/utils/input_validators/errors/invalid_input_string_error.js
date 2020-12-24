const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class InvalidInputStringError extends ApplicationError {
	static get name() {
		return 'api.1.error.invalid_input_string'
	}

	static create({
		message = 'Invalid Input String',
		code = 'invalid-input-string',
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

module.exports = { InvalidInputStringError }
