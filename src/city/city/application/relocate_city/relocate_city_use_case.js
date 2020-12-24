/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { CityNotFoundError } = require('city/city/domain/errors/city_not_found_error')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function relocateCityUseCase({ cityId, location }, { cityRepository, eventBus }) {
	const [city] = await cityRepository.findByIds([cityId])

	if (!city) {
		throw CityNotFoundError.create()
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
