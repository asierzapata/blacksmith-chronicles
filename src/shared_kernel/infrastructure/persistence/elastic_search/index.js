const assert = require('assert')
const { Client } = require('@elastic/elasticsearch')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class ElasticSearch {
	constructor({ nodeUrl }) {
		assert(nodeUrl, 'ElasticSearch - Missing nodeUrl field')
		this.nodeUrl = nodeUrl
		this.client = null
	}

	async connect() {
		this.client = new Client({ node: this.nodeUrl, maxRetries: 5, requestTimeout: 60000 })
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
