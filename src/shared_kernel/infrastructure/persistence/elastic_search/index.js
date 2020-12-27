const assert = require('assert')
const { Client } = require('@elastic/elasticsearch')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class ElasticSearch {
	constructor({ nodeUrl, apiKey }) {
		assert(nodeUrl, 'ElasticSearch - Missing nodeUrl field')
		assert(apiKey, 'ElasticSearch - Missing apiKey field')
		this.nodeUrl = nodeUrl
		this.apiKey = apiKey
		this.client = null
	}

	async connect() {
		this.client = new Client({
			node: this.nodeUrl,
			auth: { apiKey: this.apiKey },
			maxRetries: 5,
			requestTimeout: 60000,
		})
		return {
			elasticSearch: this.client,
		}
	}

	async disconnect() {
		this.client = null
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { ElasticSearch }
