'use strict'

const logger = require('./../lib/logger')
const Promise = require('bluebird')
const _ = require('lodash')

function basicValidation (server, UserModel) {
    return (request, username, password, callback) => {
        Promise.coroutine(function *() {
            try {
                const user = yield UserModel.findOneCache({email: username})
                const isMe = user && user.verifyPassword(password)
                if(isMe) { /*found user*/
                    const userWithoutPassword = _.omit(user.toObject(), ['password'])
                    return callback(null, true, userWithoutPassword)
                }

                return callback(null, false)
            } catch(err) {
                callback(err)
                logger.error(err)
            }
        })()
    }
}

module.exports = {
    basicValidation
}