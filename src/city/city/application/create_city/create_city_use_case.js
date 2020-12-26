/* ====================================================== */
/*                         Domain                         */
/* ====================================================== */

const { City } = require('city/city/domain/aggregate/city_aggregate')
const { CityLocation } = require('city/city/domain/value_objects/city_location')
const { CityName } = require('city/city/domain/value_objects/city_name')

const {
	CityAlreadyExistsError,
} = require('city/city/domain/errors/city_already_exists_error')

/* ====================================================== */
/*                       Command                          */
/* ====================================================== */

async function createCityUseCase({ cityId, userId }, { cityRepository, eventBus }) {
	const [city] = await cityRepository.findByIds([cityId])

	if (city) {
		throw CityAlreadyExistsError.create()
	}

	const name = CityName.random()
	const location = CityLocation.random()

	const newCity = await City.create({ id: cityId, userId, name, location })
	await cityRepository.save(newCity)

	const events = newCity.pullDomainEvents()
	await eventBus.publish(events, { sync: false })

	return newCity
}

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = { createCityUseCase }
