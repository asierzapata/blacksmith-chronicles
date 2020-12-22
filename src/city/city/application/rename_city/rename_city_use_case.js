/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function renameCityUseCase({ cityId, name }, { cityRepository, eventBus }) {
	const [city] = cityRepository.findByIds([cityId])

	if (!city) {
		// TODO: throw error for city not found
	}

	const renamedCity = await city.rename(name)
	await cityRepository.save(renamedCity)

	const events = renamedCity.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return renamedCity
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { renameCityUseCase }
