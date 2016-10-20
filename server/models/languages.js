'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

//Mongo Schema
const LanguageSchema = BaseSchema({
    name: {type: String, trim: true, required: true},
    slug: {type: String, trim: true},
    language: {type: String, trim: true, required: true}
})

LanguageSchema.statics.joiValidate = {
    name: Joi.string().alphanum().min(1).max(100).required(),
    slug: Joi.string(),
    language: Joi.string().alphanum().min(1).required()
}

const LanguageModel = mongoose.model('Language', LanguageSchema)

module.exports = LanguageModel