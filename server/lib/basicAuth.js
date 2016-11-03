'use strict'

const logger = require('./logger')
const _ = require('lodash')

function basicValidation (server, UserModel) {
    return async (request, username, password, callback) => {
        try {
            const user = await UserModel.findOneCache({email: username})
            const isMe = user && user.verifyPassword(password)
            if(isMe) { /*found user*/
                const userWithoutPassword = _.omit(user.toObject(), ['password_'])
                request.User = userWithoutPassword /*add current user to request object*/
                return callback(null, true, userWithoutPassword)
            }

            return callback(null, false)
        } catch(err) {
            callback(err)
            logger.error(err)
        }
    }
}

module.exports = {
    basicValidation
}