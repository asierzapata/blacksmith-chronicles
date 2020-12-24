const {
	InvalidInputStringError,
} = require('city_api/utils/input_validators/errors/invalid_input_string_error')
const {
	InvalidInputBooleanError,
} = require('city_api/utils/input_validators/errors/invalid_input_boolean_error')
const {
	InvalidInputNumberError,
} = require('city_api/utils/input_validators/errors/invalid_input_number_error')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	checkString,
	checkNumber,
	checkBoolean,
}

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

function checkString(inputString) {
	// Check var type
	if (typeof inputString !== 'string') throw InvalidInputStringError.create()

	// Maximum 1MB strings. 1 character = 1 byte
	if (inputString.length > 1 * 1024 * 1024)
		throw InvalidInputStringError.create({ message: 'Input String is too long' })

	if (inputString.length === 0) {
		throw InvalidInputStringError.create({ message: 'Input String is empty' })
	}

	return inputString
}

function checkNumber(inputNumber) {
	// Check var type
	if (typeof inputNumber !== 'number') throw InvalidInputNumberError.create()

	// Only finite numbers allowed
	if (Number.isNaN(inputNumber) || inputNumber === Infinity || inputNumber === -Infinity)
		throw InvalidInputNumberError.create({ message: 'Input Number is not finite' })

	return inputNumber
}

function checkBoolean(inputBoolean) {
	// Check var type
	if (typeof inputBoolean !== 'boolean') throw InvalidInputBooleanError.create()

	return inputBoolean
}
