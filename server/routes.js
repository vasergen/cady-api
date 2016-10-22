'use strict'

const logger = require('./lib/logger')
const Joi = require('joi')
const restify = require('./api/restify').restify
const login = require('./api/login').routes

/*Models*/
const User = require('./models/user')
const Vocabulary = require('./models/vocabulary')
const Dictionary = require('./models/dictionary')
const LanguageList = require('./models/languageList')

/*Restify API Routes*/
const userRestifyRoutes = restify(User)
const vocabularyRestifyRoutes = restify(Vocabulary)
const dictionaryRestifyRoutes = restify(Dictionary)
const languageListRestifyRoutes = restify(LanguageList)

/*User API Routes*/
const loginRoutes = login()

/*Application Routes*/
let routes = [].concat(
    /*restify*/
    userRestifyRoutes,
    vocabularyRestifyRoutes,
    dictionaryRestifyRoutes,
    languageListRestifyRoutes,

    /*login*/
    loginRoutes
)

module.exports = routes