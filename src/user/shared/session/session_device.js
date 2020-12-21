const _ = require('lodash')
const chance = require('chance').Chance()
const UAParser = require('ua-parser-js')

const ValueObject = require('shared_kernel/value_objects/value_object')

const constants = {}

/* ====================================================== */
/*                       Exceptions                       */
/* ====================================================== */

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

const DEFAULT_RANDOM_USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36'

class SessionDevice extends ValueObject {
	constructor({
		platform,
		userAgent = '',
		name = '',
		version = '',
		model = '',
		type = '',
		vendor = '',
		os = '',
		bundleVersion,
	} = {}) {
		super({
			platform,
			userAgent,
			name,
			version,
			model,
			type,
			vendor,
			os,
			bundleVersion,
		})
	}

	// Named constructors
	// ------------------
	static ios({ version = '', model = '' }) {
		const platform = constants.PLATFORM_TYPES.IOS
		return new this({
			platform,
			userAgent: '',
			name: constants.PLATFORM_NAMES.IOS_APP,
			version,
			type: _.includes(_.toLower(model), 'iphone') ? 'mobile' : 'tablet',
			vendor: 'Apple',
			model,
			os: 'iOS',
		})
	}

	static iosReactNative({ version = '', model = '', bundleVersion = '' }) {
		const platform = constants.PLATFORM_TYPES.IOS

		return new this({
			platform,
			userAgent: '',
			name: constants.PLATFORM_NAMES.IOS_REACT_NATIVE_APP,
			version,
			type: _.includes(_.toLower(model), 'iphone') ? 'mobile' : 'tablet',
			vendor: 'Apple',
			model,
			os: 'iOS',
			bundleVersion,
		})
	}

	static android({ version = '', model = '' }) {
		const platform = constants.PLATFORM_TYPES.ANDROID
		return new this({
			platform,
			userAgent: '',
			name: constants.PLATFORM_NAMES.ANDROID_APP,
			version,
			type: 'mobile',
			vendor: '',
			model,
			os: 'Android',
		})
	}

	static androidReactNative({ version = '', model = '', bundleVersion = '' }) {
		const platform = constants.PLATFORM_TYPES.ANDROID
		return new this({
			platform,
			userAgent: '',
			name: constants.PLATFORM_NAMES.ANDROID_REACT_NATIVE_APP,
			version,
			type: 'mobile',
			vendor: '',
			model,
			os: 'Android',
			bundleVersion,
		})
	}

	static web({ userAgent = '', bundleVersion = '' }) {
		const platform = constants.PLATFORM_TYPES.WEB
		if (!userAgent || _.includes(userAgent, 'node-superagent'))
			return new this({ platform })

		const userAgentData = new UAParser(userAgent).getResult() // { browser: {}, device: {}, os: {}, ...}
		if (_.isEmpty(userAgentData)) return new this({ platform, userAgent })

		return new this({
			platform,
			userAgent,
			name: userAgentData.browser.name,
			version: userAgentData.browser.version,
			bundleVersion,
			type: userAgentData.device.type,
			vendor: userAgentData.device.vendor,
			model: userAgentData.device.model,
			os: userAgentData.os.name,
		})
	}

	static undetectable() {
		return new this({ platform: '' })
	}

	static detect({ platform, userAgent, version, model, bundleVersion }) {
		// iOS
		// ---
		if (platform === constants.PLATFORM_TYPES.IOS && bundleVersion) {
			return this.iosReactNative({ version, model, bundleVersion })
		}
		if (platform === constants.PLATFORM_TYPES.IOS) return this.ios({ version, model })

		// Android
		// -------
		if (platform === constants.PLATFORM_TYPES.ANDROID && bundleVersion) {
			return this.androidReactNative({ version, model, bundleVersion })
		}
		if (platform === constants.PLATFORM_TYPES.ANDROID)
			return this.android({ version, model })

		// Web
		// ---
		if (platform === constants.PLATFORM_TYPES.WEB)
			return this.web({ userAgent, bundleVersion })

		return this.undetectable()
	}

	static random({
		platform = chance.pickone(_.values(constants.PLATFORM_TYPES)),
		userAgent = DEFAULT_RANDOM_USER_AGENT,
		version = `${chance.natural({ max: 20 })}.${chance.natural({
			max: 20,
		})}.${chance.natural({ max: 20 })}`,
		model = chance.pickone(['iPhone', 'iPad', 'Samsung S20', 'Macbook Pro 16']),
		bundleVersion = chance.pickone(['2.2.2', undefined]),
	} = {}) {
		return this.detect({ platform, userAgent, version, model, bundleVersion })
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { SessionDevice }
