const chance = require('chance').Chance()

const ValueObject = require('shared_kernel/value_objects/value_object')

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class SessionLocation extends ValueObject {
	constructor({ ip }) {
		super({ ip })
	}

	static random({ ip = chance.ip() } = {}) {
		return new this({ ip })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { SessionLocation }
