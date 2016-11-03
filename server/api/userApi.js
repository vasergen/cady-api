'use strict'

const User = require('./../models/user')
const util = require('./../lib/util')
const Joi = require('joi')
const tch = util.tryCatchHandler

/**
 * User add language
 * @param Model
 * @returns {{path: *, method: string, handler: Function, config: {description: string, tags: string[], validate: {payload: {name: *, longName: *}}}}}
 * @private
 */
function _postLanguageRoute(Model) {
    const collection = util.getCollectionName(Model)

    function postLanguageHandler(request, reply) {
        const currentUser = request.User
        const result = Model.addLanguage(currentUser._id, request.payload)
        reply(result)
    }

    return {
        path: `/${collection}/languages`, method: 'POST', handler: tch(postLanguageHandler), config: {
            description: 'add new language',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().min(1).required(),
                    longName: Joi.string().min(1).required()
                }
            }
        }
    }
}

/**
 * User get languages
 * @param Model
 * @returns {{path: *, method: string, handler: Function, config: {description: string, tags: string[], validate: {}}}}
 * @private
 */
function _getLanguagesRoute(Model) {
    const collection = util.getCollectionName(Model)

    async function getLanguageHandler(request, reply) {
        const id = request.User._id

        const user = await Model.findById(id)
        const languages = user.languages || []
        reply(languages)
    }

    return {
        path: `/${collection}/languages`, method: 'GET', handler: tch(getLanguageHandler), config: {
            description: 'get languages',
            tags: ['api'],
            validate: {}
        }
    }
}

/**
 * Add dictionary to language
 * @param Model
 * @returns {{path: *, method: string, handler: Function, config: {description: string, tags: string[], validate: {payload: {name: *}}}}}
 * @private
 */
function _postDictionaryRoute(Model) {
    const collection = util.getCollectionName(Model)

    function postLanguageHandler(request, reply) {
        const id = request.User._id
        const languageSlug = request.params.languageSlug

        const newDictionary = Model.addDictionary(id, languageSlug, request.payload)

        reply(newDictionary)
    }

    return {
        path: `/${collection}/{languageSlug}/dictionaries`, method: 'POST', handler: tch(postLanguageHandler), config: {
            description: 'add new dictionary',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().min(1).required()
                },
                params: {
                    languageSlug: Joi.string()
                }
            }
        }
    }
}

function routes() {
    return [
        _postLanguageRoute(User),
        _getLanguagesRoute(User),
        _postDictionaryRoute(User)
    ]
}

module.exports = {
    /*private*/
    _postLanguageRoute,
    _getLanguagesRoute,

    /*public*/
    routes
}