'use strict'

const logger = require('./lib/logger')
const Joi = require('joi')
const restify = require('./api/restify').restify

//Models
const User = require('./models/user')
const Vocabulary = require('./models/vocabulary')
const Dictionary = require('./models/dictionary')

//Restify Models
const userRestifyRoutes = restify(User)
const vocabularyRestifyRoutes = restify(Vocabulary)
const dictionaryRestifyRoutes = restify(Dictionary)

let routes = [].concat(
    userRestifyRoutes,
    vocabularyRestifyRoutes,
    dictionaryRestifyRoutes
)

module.exports = routes