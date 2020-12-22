/* ====================================================== */
/*                        Domain                          */
/* ====================================================== */

/* ====================================================== */
/*                        Query                           */
/* ====================================================== */

async function getCitiesByUserIdUseCase({ userId }, { cityRepository }) {
	const cities = cityRepository.findByUserId(userId)

	return cities
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { getCitiesByUserIdUseCase }
