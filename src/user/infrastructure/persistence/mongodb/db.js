const assert = require('assert')
const MongoClient = require('mongodb').MongoClient

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class Database {
	constructor({ url, name, logger }) {
		assert(url, 'Database - Missing url field')
		assert(name, 'Database - Missing name field')
		this.url = url
		this.name = name
		this.logger = logger
	}

	async connect() {
		const client = await MongoClient.connect(this.url, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			logger: this.logger,
		})

		this.client = client
		this.db = client.db(this.name)

		return {
			db: this.db,
			startTransaction() {
				// const session = client.startSession()
				// session.startTransaction()
				return {
					async commitTransaction() {
						// await session.commitTransaction()
						// session.endSession()
					},
					async abortTransaction() {
						// await session.abortTransaction()
						// session.endSession()
					},
				}
			},
		}
	}

	async disconnect() {
		if (this.client) await this.client.close()
		this.client = undefined
		this.db = undefined
	}

	async drop() {
		return new Promise((resolve, reject) => {
			this.db.dropDatabase((err) => {
				if (err) return reject(err)
				this.disconnect()
				return resolve()
			})
		})
	}
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = Database
