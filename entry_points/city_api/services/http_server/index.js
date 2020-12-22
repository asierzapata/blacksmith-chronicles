const http = require('http')

const SERVER = {
	UNSTARTED: 'unstarted',
	STARTED: 'started',
}

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

class HTTPServer {
	constructor({ app, port }) {
		this.status = SERVER.UNSTARTED
		this.server = null
		this.app = app
		this.port = port
	}

	start({ logger }) {
		return new Promise((resolve, reject) => {
			if (this.status === SERVER.STARTED) return resolve()

			this.server = http.createServer(this.app)
			this.server.on('error', (err) => reject(err))
			this.server.on('close', () => {
				logger.info('HTTP server closed')
			})

			this.server.listen(this.port, () => {
				this.status = SERVER.STARTED
				logger.info(`HTTP server started!`)
				logger.info(`HTTP server listening on port ${this.port}`)
				return resolve(this.app)
			})
		})
	}

	stop() {
		return new Promise((resolve, reject) => {
			if (this.status === SERVER.UNSTARTED) return resolve()

			this.server.on('error', (err) => reject(err))
			this.server.on('close', () => {
				this.status = SERVER.UNSTARTED
				return resolve()
			})
			this.server.close()
			this.server = null
		})
	}
}

/* ====================================================== */
/*                       Public API                       */
/* ====================================================== */

module.exports = HTTPServer
