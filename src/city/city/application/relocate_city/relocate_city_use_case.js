/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function relocateCityUseCase({ cityId, location }, { cityRepository, eventBus }) {
	const [city] = cityRepository.findByIds([cityId])

	if (!city) {
		// TODO: throw error for city not found
	}

	const relocatedCity = await city.relocate(location)
	await cityRepository.save(relocatedCity)

	const events = relocatedCity.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return relocatedCity
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { relocateCityUseCase }
