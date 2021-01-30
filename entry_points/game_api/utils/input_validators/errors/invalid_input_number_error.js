const { ApplicationError } = require('shared_kernel/errors/application_error')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

class InvalidInputNumberError extends ApplicationError {
	static get name() {
		return 'api.1.error.invalid_input_number'
	}

	static create({
		message = 'Invalid Input Number',
		code = 'invalid-input-number',
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

module.exports = { InvalidInputNumberError }
