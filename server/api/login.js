'use strict'

const User = require('./../models/user')
const _ = require('lodash')
const util = require('./../lib/util')
const logger = require('./../lib/logger')
const Boom = require('boom')
const Promise = require('bluebird')
const md5 = require('md5')

function _loginRoute(UserModel) {
    function loginHandler(request, reply) {
        Promise.coroutine(function *() {
            try {
                const payload = request.payload
                const user = yield UserModel.findOne(_.pick(payload, ['email']))
                const password = md5(payload.password)
                const isMe = user && user.password === password
                if(!user || !isMe) {
                    return reply(Boom.unauthorized('Invalid password or email. Please try one more time'))
                }
                const userWithoutPassword = _.omit(user.toObject(), ['password'])
                return reply(userWithoutPassword)
            } catch(err) {
                reply(err)
                logger.error(err)
            }
        })()
    }

    const requiredFields = ['email', 'password']
    const joiValidate = util.joiValidateAddRequired(UserModel.joiValidate, requiredFields)

    return {
        path: '/login', method: 'POST', handler: loginHandler, config: {
            description: 'user login',
            tags: ['api'],
            validate: {
                payload: joiValidate
            }
        }
    }
}

function _logoutRoute() {
    function logoutHandler(request, reply) {
        reply('logout')
    }

    return {
        path: '/logout', method: 'GET', handler: logoutHandler, config: {
            description: 'user logout',
            tags: ['api'],
            validate: {}
        }
    }
}

function _registerRoute(UserModel) {
    function registerHandler(request, reply) {
        Promise.coroutine(function *() {
            try {
                const payload = request.payload
                payload.password = md5(payload.password)
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
        _loginRoute(User),
        _logoutRoute()
    ]
}

module.exports = {
    /*private*/
    _loginRoute,
    _registerRoute,
    _logoutRoute,
    /*public*/
    routes
}