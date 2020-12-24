/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function relocateCityUseCase({ cityId, location }, { cityRepository, eventBus }) {
	const [city] = await cityRepository.findByIds([cityId])

	if (!city) {
		// TODO: throw error for city not found
	}

	await city.relocate(location)
	await cityRepository.save(city)

	const events = city.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return city
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { relocateCityUseCase }
