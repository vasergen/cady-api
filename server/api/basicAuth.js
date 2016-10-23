'use strict'

const logger = require('./../lib/logger')
const Promise = require('bluebird')
const _ = require('lodash')

function basicValidation (UserModel) {
    return (request, username, password, callback) => {
        Promise.coroutine(function *() {
            try {
                const user = yield UserModel.findOne({email: username})
                const isMe = user && user.verifyPassword(password)
                if(!isMe) {
                    return callback(null, false)
                }
                const userWithoutPassword = _.omit(user.toObject(), ['password'])
                return callback(null, true, userWithoutPassword)
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