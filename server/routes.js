'use strict'

const logger = require('./lib/logger')
const Joi = require('joi')
const restify = require('./api/restify').restify

//Models
const User = require('./models/user')
const Vocabulary = require('./models/vocabulary')
const Dictionary = require('./models/dictionary')
const LanguageList = require('./models/languageList')

//Restify Models
const userRestifyRoutes = restify(User)
const vocabularyRestifyRoutes = restify(Vocabulary)
const dictionaryRestifyRoutes = restify(Dictionary)
const languageListRestifyRoutes = restify(LanguageList)

let routes = [].concat(
    userRestifyRoutes,
    vocabularyRestifyRoutes,
    dictionaryRestifyRoutes,
    languageListRestifyRoutes
)

module.exports = routes