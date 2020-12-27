const elasticSearchAPM = require('elastic-apm-node')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing')
	dotenv.config({ path: `../../src/city/shared/env/${process.env.NODE_ENV}.env` })

if (process.env.NODE_ENV === 'production') {
	elasticSearchAPM.start({
		// Override service name from package.json
		// Allowed characters: a-z, A-Z, 0-9, -, _, and space
		serviceName: 'City API',

		// Set custom APM Server URL (default: http://localhost:8200)
		serverUrl: process.env.ELASTIC_SEARCH_APM_HOST,
	})
}

const cluster = require('cluster')
const os = require('os')
const env = require('city/shared/env')
const Application = require('./application')

/* ====================================================== */
/*                     Implementation                     */
/* ====================================================== */

const cpuCount = env.isProduction || env.isLoad ? os.cpus().length : 1

if (cluster.isMaster) {
	console.log(`Server has ${cpuCount} CPU${cpuCount > 1 ? 's' : ''}`)
	console.log('👑   Running Master Fork')

	// Start workers
	for (let i = 0; i < cpuCount; i += 1) {
		createChild()
	}

	cluster.on('exit', () => {
		console.log('❌   Child Fork Died')

		// Start a new worker
		createChild()
	})
} else {
	console.log('👶   Running Child Fork')
	const application = new Application()
	// eslint-disable-next-line promise/catch-or-return
	application.start().then(({ serverLogger }) => {
		process.on('unhandledRejection', (err) => serverLogger.fatal(err))
		return
	})
}

function createChild() {
	try {
		cluster.fork()
	} catch (error) {
		console.log('❌   Creation of Child Fork Failed')
		console.error(error)
	}
}
