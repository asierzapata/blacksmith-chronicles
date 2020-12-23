/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	checkString,
	invalidInputStringError,
	checkNumber,
	invalidInputNumberError,
	checkBoolean,
	invalidInputBooleanError,
}

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

function checkString(inputString) {
	// Check var type
	if (typeof inputString !== 'string') throw invalidInputStringError()

	// Maximum 1MB strings. 1 character = 1 byte
	if (inputString.length > 1 * 1024 * 1024)
		throw invalidInputStringError({ message: 'Input String is too long' })

	return inputString
}

function invalidInputStringError({ message = 'Invalid String provided' } = {}) {
	return new Error(message)
}

function checkNumber(inputNumber) {
	// Check var type
	if (typeof inputNumber !== 'number') throw invalidInputNumberError()

	// Only finite numbers allowed
	if (Number.isNaN(inputNumber) || inputNumber === Infinity || inputNumber === -Infinity)
		throw invalidInputNumberError({ message: 'Input Number is not finite' })

	return inputNumber
}

function invalidInputNumberError({ message = 'Invalid Number provided' } = {}) {
	return new Error(message)
}

function checkBoolean(inputBoolean) {
	// Check var type
	if (typeof inputBoolean !== 'boolean') throw invalidInputBooleanError()

	return inputBoolean
}

function invalidInputBooleanError({ message = 'Invalid Boolean provided' } = {}) {
	return new Error(message)
}
