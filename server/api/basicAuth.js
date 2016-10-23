'use strict'

const logger = require('./../lib/logger')
const Promise = require('bluebird')
const _ = require('lodash')
const md5 = require('md5')

function basicValidation (server, UserModel) {
    const oneMin = 60000
    const options = { segment: 'users', expiresIn: 10 * oneMin}
    const cache = server.cache(options)

    function cacheGet(key) {
        return new Promise((resolve, reject) => {
            cache.get(key, (err, value /*cached,*/ /*log*/) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }

    function cacheSet(key, value) {
        return new Promise((resolve, reject) => {
            cache.set(key, value, null, (err) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }

    return (request, username, password, callback) => {
        Promise.coroutine(function *() {
            try {
                const cacheKey = md5(username + password)
                const userCashed = yield cacheGet(cacheKey)

                if(userCashed) { /*user is in cache*/
                    return callback(null, true, userCashed)
                }

                const user = yield UserModel.findOne({email: username})
                const isMe = user && user.verifyPassword(password)
                if(isMe) { /*found user*/
                    const userWithoutPassword = _.omit(user.toObject(), ['password'])
                    yield cacheSet(cacheKey, userWithoutPassword)
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