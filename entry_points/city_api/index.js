const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing')
	dotenv.config({ path: `../../src/city/shared/env/${process.env.NODE_ENV}.env` })

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
