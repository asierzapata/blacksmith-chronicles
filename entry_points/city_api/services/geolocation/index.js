const _ = require('lodash')
const https = require('https')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

// TODO: implement in-memory cache to avoid spamming IPAPI

class GeolocationService {
	constructor({ envVars, secretKey, userAgent, cache } = {}) {
		// TODO: implement cache
		this.cache = cache
		this.envVars = envVars
		this.secretKey = secretKey
		this.userAgent = userAgent
	}

	lookUpIp(ip) {
		return new Promise((resolve, reject) => {
			if (!ip) return reject(new Error(`No 'ip' provided`))

			// TODO: remove this
			if (!this.envVars.isProduction) {
				return resolve({
					ip,
					city: 'Barcelona',
					region: 'Catalonia',
					regionCode: 'CA',
					countryName: 'Spain',
					countryCode: 'ES',
					continentCode: 'EU',
					postal: '08008',
					latitude: 41.3891,
					longitude: 2.1611,
					timezone: 'Europe/Madrid',
					utcOffset: '+0100',
					countryCallingCode: '+34',
					currency: 'EUR',
					languages: 'es-ES,ca,gl,eu,oc',
					asn: 'AS3352',
					org: 'Telefonica De Espana',
					inEu: true,
				})
			}

			https.get(`https://ipapi.co/${ip}/json/`, (resp) => {
				let body = ''
				resp.on('error', (error) => reject(error))
				resp.on('data', (data) => {
					body += data
				})
				resp.on('end', () => {
					const location = JSON.parse(body)
					return resolve({
						ip,
						city: location.city,
						region: location.region_code,
						regionCode: location.city,
						countryName: location.country_name,
						countryCode: location.country,
						continentCode: location.continent_code,
						postal: location.postal,
						latitude: location.latitude,
						longitude: location.longitude,
						timezone: location.timezone,
						utcOffset: location.utc_offset,
						countryCallingCode: location.country_calling_code,
						currency: location.currency,
						languages: location.languages,
						asn: location.asn,
						org: location.org,
						inEu: location.in_eu,
					})
				})
			})
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { GeolocationService }
