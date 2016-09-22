'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')

let UserSchema = BaseSchema({
    lastName: { type: String, trim: true, default: '' },
    firstName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' }
})

let UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel