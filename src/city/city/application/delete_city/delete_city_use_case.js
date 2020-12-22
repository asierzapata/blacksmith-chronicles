/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function deleteCityUseCase({ cityId, name }, { cityRepository, eventBus }) {
	const [city] = cityRepository.findByIds([cityId])

	if (!city) {
		// TODO: throw error for city not found
	}

	const deletedCity = await city.delete(name)
	await cityRepository.save(deletedCity)

	const events = deletedCity.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return deletedCity
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { deleteCityUseCase }
