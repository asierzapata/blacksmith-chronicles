/* ====================================================== */
/*                        Domain                          */
/* ====================================================== */

/* ====================================================== */
/*                        Query                           */
/* ====================================================== */

async function getResourcesForCityUseCase({ cityId }, { resourceRepository }) {
	const resources = resourceRepository.findByCityId(cityId)

	return resources
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { getResourcesForCityUseCase }
