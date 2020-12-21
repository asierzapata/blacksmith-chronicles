const { v4: uuidv4, validate: uuidValidate } = require('uuid')
const { nanoid, customAlphabet, urlAlphabet } = require('nanoid')

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	generateUUID,
	isValid,
	publicId,
	custom,
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

function generateUUID() {
	return uuidv4()
}

function isValid(id) {
	return uuidValidate(id)
}

// Collision risk: https://zelark.github.io/nano-id-cc/
function publicId() {
	return nanoid(16)
}

function custom({ length = 16, alphabet = urlAlphabet }) {
	return customAlphabet(alphabet, length)()
}
