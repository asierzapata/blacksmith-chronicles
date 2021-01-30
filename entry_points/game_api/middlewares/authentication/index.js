const envVars = require('shared_kernel/env')
const _ = require('lodash')
const moment = require('moment')

/* ====================================================== */
/*                    Value Objects                       */
/* ====================================================== */

const { Session } = require('city/shared/session/session')
const { SessionLocation } = require('city/shared/session/session_location')
const { SessionDevice } = require('city/shared/session/session_device')

/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

// TODO:
// Use res to refresh the cookie when necessary

function authenticate(req, res, next) {
	const ip = req.ip
	const userAgent = req.get('User-Agent')
	const clientSessionId = req.get('Client-Session-Id')
	const clientVersion = req.get('Client-Version')
	const clientWindowWidth = req.get('Client-Window-Width')
	const clientWindowHeight = req.get('Client-Window-Height')

	const sessionToken = getTokenFromRequest(req)

	let locationData
	req.geolocationService
		.lookUpIp(ip)
		.then((_locationData) => {
			locationData = _locationData
			return req.authenticationService.verify(sessionToken)
		})
		.then((sessionData) => {
			const device = SessionDevice.browserUserAgent({
				userAgent,
				screenWidth: clientWindowWidth,
				screenHeight: clientWindowHeight,
			}).toValue()

			const location = new SessionLocation(locationData).toValue()

			if (!sessionData) {
				req.session = Session.unauthenticated({
					id: clientSessionId,
					device,
					location,
				}).toValue()
				// eslint-disable-next-line promise/no-callback-in-promise
				return next()
			}

			const session = new Session({
				id: clientSessionId,
				type: sessionData.type,
				distinctId: sessionData.distinctId,
				device,
				location,
			})

			const { refreshedAutorizationHeader, refreshedCookie } = refreshToken({
				session,
				currentToken: {
					iat: sessionData.iat,
					exp: sessionData.exp,
					jti: sessionData.jti,
				},
				authenticationService: req.authenticationService,
			})
			if (refreshedAutorizationHeader) {
				res.append('Authorization', refreshedAutorizationHeader.data)
			}
			if (refreshedCookie) {
				res.cookie(
					refreshedCookie.cookieName,
					refreshedCookie.data,
					refreshedCookie.config
				)
			}

			// TODO: respond with jwtToken in meta too

			req.session = session.toValue()
			return
		})
		// eslint-disable-next-line promise/no-callback-in-promise
		.catch((err) => next(err))
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = {
	authenticate,
}

/* ====================================================== */
/*                        Helpers                         */
/* ====================================================== */

async function refreshToken({ session, currentToken, authenticationService }) {
	const mIssuedAt = moment.unix(currentToken.iat)
	const mHoursAgo = moment().subtract(1, 'hour')

	// Do not refresh if token was issued less than 1 hour ago
	if (mIssuedAt.isAfter(mHoursAgo)) return

	// TODO: Blacklist the tokenId (currentToken.jti)

	const {
		jwtToken,
		cookie,
		authorizationHeader,
	} = await authenticationService.authenticate(session)

	return {
		refreshedJwtToken: jwtToken,
		refreshedCookie: cookie,
		refreshedAutorizationHeader: authorizationHeader,
	}
}

function getTokenFromRequest(req) {
	let token = ''

	// Get token from cookie
	if (!_.isEmpty(req.cookies[envVars.jwt.cookieName]))
		token = req.cookies[envVars.jwt.cookieName]

	// Get token from Header "Authorization: 'Bearer abc.123.xyz'"
	if (!_.isEmpty(req.headers.authorization))
		token = _.replace(req.headers.authorization, 'Bearer ', '')

	return token
}
