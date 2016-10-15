'use strict'

const logger = require('./lib/logger')
const Joi = require('joi')
const User = require('./models/user')
const UserAPI = require('./api/userAPI')
const CRUD = require('./api/CRUD').CRUD

let userCRUD = CRUD(User)

let routes = [

]

module.exports = [].concat(userCRUD, routes)