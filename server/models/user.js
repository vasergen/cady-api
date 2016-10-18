'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

//Mongo Schema
const UserSchema = BaseSchema({
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' }
})

UserSchema.statics.joiValidate = {
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    email: Joi.string().email()
}

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel