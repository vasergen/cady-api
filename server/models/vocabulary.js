'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

const ObjectId = mongoose.Schema.ObjectId

//Mongo Schema
const VocabularySchema = BaseSchema({
    userId: {type: ObjectId, trim: true, required: true},
    slug: {type: String, trim: true},
    word: {type: String, trim: true, required: true},
    translate: {type: String, trim: true, required: true},
    language: {type: String, trim: true},
    dictionary: {type: [ObjectId], trim: true} //array of dictionaries ids
})

VocabularySchema.statics.joiValidate = {
    userId: Joi.string(),
    slug: Joi.string(),
    word: Joi.string().min(1).required(),
    translate: Joi.string().required(),
    language: Joi.string().required(),
    dictionary: Joi.string().required()
}

const VocabularyModel = mongoose.model('Vocabulary', VocabularySchema)

module.exports = VocabularyModel