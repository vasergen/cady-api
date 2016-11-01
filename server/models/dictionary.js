'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

//Mongo Schema
const DictionarySchema = BaseSchema({
    name: {type: String, trim: true, required: true},
    slug: {type: String, trim: true}
})

DictionarySchema.statics.joiValidate = {
    name: Joi.string().alphanum().min(1).max(100),
    slug: Joi.string()
}

const DictionaryModel = mongoose.model('Dictionary', DictionarySchema)

module.exports = DictionaryModel