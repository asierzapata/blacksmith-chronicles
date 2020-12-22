const assert = require('assert')
const jwt = require('jsonwebtoken')
const uuid = require('shared_kernel/uuid')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class JWTService {
	constructor({ secret, algorithm, expiration }) {
		assert(secret, 'JWT Service - Missing secret')
		assert(algorithm, 'JWT Service - Missing algorithm')
		assert(expiration, 'JWT Service - Missing expiration')
		this._secret = secret
		this._algorithm = algorithm
		this._expiration = expiration
	}

	generateToken(data) {
		assert(data, 'JWT Service - Missing data')
		return new Promise((resolve, reject) => {
			jwt.sign(
				data,
				this._secret,
				{
					jwtid: uuid.generateUUID(),
					algorithm: this._algorithm,
					expiresIn: this._expiration,
				},
				(err, token) => {
					if (err) return reject(err)
					return resolve(token)
				}
			)
		})
	}

	decodeToken(token) {
		return new Promise((resolve, reject) => {
			jwt.verify(
				token,
				this._secret,
				{
					algorithms: [this._algorithm],
				},
				(err, { iat, exp, jti, ...decodeToken }) => {
					if (err) return reject(err)
					return resolve({
						iat,
						exp,
						jti,
						...decodeToken,
					})
				}
			)
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { JWTService }
