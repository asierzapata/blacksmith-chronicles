/* ====================================================== */
/*                   Implementation                       */
/* ====================================================== */

function applyMiddleware(middlewares) {
	let fnWithMiddleware
	middlewares
		.slice()
		.reverse()
		.forEach((middleware) => {
			fnWithMiddleware = middleware(fnWithMiddleware)
		})
	return fnWithMiddleware
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { applyMiddleware }
