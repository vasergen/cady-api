'use strict'

/**
 * This model is only list of languages
 * @type {mongoose|exports|module.exports}
 */

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

//Mongo Schema
const LanguageListSchema = BaseSchema({
    name: {type: String, trim: true, required: true},
    slug: {type: String, trim: true},
    language: {type: String, trim: true, required: true}
})

LanguageListSchema.statics.joiValidate = {
    name: Joi.string().alphanum().min(1).max(100).required(),
    slug: Joi.string(),
    language: Joi.string().alphanum().min(1).required()
}

LanguageListSchema.set('collection', 'languageslist') /*set correct name for collection*/
const LanguageListModel = mongoose.model('LanguageList', LanguageListSchema)

module.exports = LanguageListModel