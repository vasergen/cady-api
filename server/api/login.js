'use strict'

const User = require('./../models/user')
const util = require('./../lib/util')
const logger = require('./../lib/logger')
const Boom = require('boom')

const tryCatch = util.tryCatch

/**
 * Sign in
 * @returns {{path: string, method: string, handler: signInHandler, config: {description: string, tags: string[]}}}
 * @private
 */
function _signInRoute() {
    function signInHandler(request, reply) {
        const user = request.User

        if(!user._id) {
            logger.error('User object didn\'t found')
            return reply(Boom.badImplementation())
        }

        return reply(user)
    }

    return {
        path: '/login', method: 'GET', handler: signInHandler, config: {
            description: 'user login',
            tags: ['api']
        }
    }
}

/**
 * Sign up
 * @param UserModel
 * @returns {{path: string, method: string, handler: signUpHandler, config: {description: string, notes: *, tags: string[], validate: {payload: *}}}}
 * @private
 */
function _signUpRoute(UserModel) {
    async function signUpHandler(request, reply) {
        const payload = request.payload
        const count = await UserModel.count({email: payload.email})
        if(count) { /*duplicate*/
            const errMessage = `This email ${payload.email} has been taken`
            return reply(Boom.badData(errMessage))
        }

        const user = new UserModel(payload)
        const response = await user.save()

        return reply(response).code(201)
    }

    const requiredFields = ['firstName', 'email', 'password']
    const joiValidate = util.joiValidateAddRequired(UserModel.joiValidate, requiredFields)

    return {
        path: '/register', method: 'POST', handler: tryCatch(signUpHandler), config: {
            auth: false,
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
        _signUpRoute(User),
        _signInRoute()
    ]
}

module.exports = {
    /*private*/
    _signInRoute,
    _signUpRoute,

    /*public*/
    routes
}