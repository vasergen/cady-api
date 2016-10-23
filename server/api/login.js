'use strict'

const User = require('./../models/user')
const util = require('./../lib/util')
const logger = require('./../lib/logger')
const Boom = require('boom')
const Promise = require('bluebird')

function _loginRoute() {
    function loginHandler(request, reply) {
        const user = request.auth.credentials

        if(!user._id) {
            logger.error('User object didn\'t found')
            return reply(Boom.badImplementation())
        }

        return reply(user)
    }

    return {
        path: '/login', method: 'GET', handler: loginHandler, config: {
            description: 'user login',
            tags: ['api']
        }
    }
}

function _registerRoute(UserModel) {
    function registerHandler(request, reply) {
        Promise.coroutine(function *() {
            try {
                const payload = request.payload
                const count = yield UserModel.count({email: payload.email})
                if(count) { /*duplicate*/
                    const errMessage = `This email ${payload.email} has been taken`
                    return reply(Boom.badData(errMessage))
                }

                const user = new UserModel(payload)
                const response = yield user.save()
                return reply(response).code(201)
            } catch(err) {
                reply(err)
                logger.error(err)
            }
        })()
    }

    const requiredFields = ['firstName', 'email', 'password']
    const joiValidate = util.joiValidateAddRequired(UserModel.joiValidate, requiredFields)

    return {
        path: '/register', method: 'POST', handler: registerHandler, config: {
            description: 'register user',
            notes: `required fields: ${requiredFields.toString()}`,
            tags: ['api'],
            validate: {
                payload: joiValidate
            }
        }
    }
}

function routes() {
    return [
        _registerRoute(User),
        _loginRoute()
    ]
}

module.exports = {
    /*private*/
    _loginRoute,
    _registerRoute,
    /*public*/
    routes
}