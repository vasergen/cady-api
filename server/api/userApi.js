'use strict'

const User = require('./../models/user')
const util = require('./../lib/util')
const Boom = require('boom')
const Joi = require('joi')
const _ = require('lodash')

const tch = util.tryCatchHandler

function _postLanguageRoute(Model) {
    const collection = util.getCollectionName(Model)

    const validate = {
        name: Joi.string().min(1).required(),
        longName: Joi.string().min(1).required()
    }

    async function postLanguageHandler(request, reply) {
        const currentUser = request.User
        const payload = _.pick(request.payload, _.keys(validate))
        payload.dictionaries = []
        payload.slug = util.slug(payload.name)

        const user = await Model.findById({_id: currentUser._id})
        const languages = _.filter(user.languages, {slug: payload.slug})

        if(languages.length) { /*duplicate*/
            const errMessage = `this language ${languages[0].name} already exist`
            return reply(Boom.badData(errMessage))
        }

        const userUpdated = await Model.update({_id: currentUser._id}, {$push: {languages: payload}})
        return reply(userUpdated)
    }

    return {
        path: `/${collection}/language`, method: 'POST', handler: tch(postLanguageHandler), config: {
            description: 'create new dictionary',
            tags: ['api'],
            validate: {
                payload: validate
            }
        }
    }
}

function routes() {
    return [
        _postLanguageRoute(User)
    ]
}

module.exports = {
    /*private*/
    _postLanguageRoute,

    /*public*/
    routes
}