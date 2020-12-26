const assert = require('assert')
const _ = require('lodash')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class ElasticSearchBusMessagesStore {
	constructor({ elasticSearch }) {
		assert(
			elasticSearch,
			'Elastic Search Buss Messages Store - Missing Elastic Search client'
		)
		this.elasticSearch = elasticSearch
	}

	// Write
	// -----

	async save(messages) {
		if (_.isEmpty(messages)) return messages
		const body = _.flatMap(messages, (message) => [
			{ index: { _index: 'bus_messages', _id: message.id } },
			message,
		])
		await this.elasticSearch.bulk({ body })
		return messages
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ElasticSearchBusMessagesStore }
