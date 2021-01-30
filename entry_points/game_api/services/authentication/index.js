const ms = require('ms')
const { JWTService } = require('game_api/services/jwt')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class AuthenticationService {
	constructor({ secret, algorithm, expiration, cookieName }) {
		this.jwtService = new JWTService({ secret, algorithm, expiration })
		this.cookieName = cookieName
		this.cookieConfig = {
			secure: true,
			httpOnly: true,
			maxAge: ms(expiration),
		}
	}

	async authenticate(session) {
		if (!session) throw new Error('AuthenticationService.authenticate')
		const token = await this.jwtService.generateToken({
			type: session.getType().toValue(),
			distinctId: session.getUserId().toValue(),
		})
		return {
			jwtToken: token,
			authorizationHeader: {
				data: `Bearer ${token}`,
			},
			cookie: {
				cookieName: this.cookieName,
				data: token,
				config: this.cookieConfig,
			},
		}
	}

	async verify(token) {
		try {
			if (!token) return
			const tokenData = await this.jwtService.decodeToken(token)
			return {
				iat: tokenData.iat,
				exp: tokenData.exp,
				jti: tokenData.jti,
				// Data
				type: tokenData.type,
				distinctId: tokenData.distinctId,
			}
		} catch (err) {
			return
		}
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { AuthenticationService }
