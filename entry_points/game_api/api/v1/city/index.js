const router = require('express').Router()

/* ====================================================== */
/*                      Middlewares                       */
/* ====================================================== */

/* ====================================================== */
/*                       Handlers                         */
/* ====================================================== */

const { createCity } = require('./create_city/create_game_api_controller')
const { deleteCity } = require('./delete_city/delete_game_api_controller')
const { getCityById } = require('./get_city_by_id/get_city_by_id_api_controller')
const {
	getCitiesByUserId,
} = require('./get_cities_by_user_id/get_cities_by_user_id_api_controller')
const { relocateCity } = require('./relocate_city/relocate_game_api_controller')
const { renameCity } = require('./rename_city/rename_game_api_controller')

/* ====================================================== */
/*                    Implementation                      */
/* ====================================================== */

// Parent: /cities

router.post('/', createCity)

router.get('/:cityId', getCityById)

router.delete('/:cityId', deleteCity)

router.put('/:cityId/name', renameCity)

router.put('/:cityId/location', relocateCity)

router.get('/user/:userId', getCitiesByUserId)

/* ====================================================== */
/*                      Public API                        */
/* ====================================================== */

module.exports = router
