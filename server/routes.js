'use strict'

const logger = require('./lib/logger')
const Joi = require('joi')
const User = require('./models/user')
const UserAPI = require('./api/userAPI')
const restify = require('./api/restify').restify

let userCRUD = restify(User)

let routes = [

]

module.exports = [].concat(userCRUD, routes)