'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')
const md5 = require('md5')
const _ = require('lodash')
const Boom = require('boom')
const util = require('./../lib/util')

/*
* Example
* {
*   firstName: 'Bob',
*   lastName: 'Marlin'
*   email: 'bob@gmail.com',
*   password: '*****',
*   languages: [
*       {
*           name: 'pl',
*           slug: 'pl',
*           longName: 'Polish',
*           dictionaries: [
*               56asd345asadaad,
*               56asd3454ffh6h6
*           ]
*       },
*       {
*           name: 'sp',
*           slug: 'sp',
*           longName: 'spanish',
*           dictionaries: [
*               56asd3454asdas6,
 *              56asd6y7jhhr643
*           ]
*       }
*   ]
*   activeLanguage: 'pl',
*   activeDictionary: '56asd3454asdas6'
* }
* */

/*Schema*/
const UserSchema = BaseSchema({
    firstName: {type: String, trim: true, default: ''},
    lastName: {type: String, trim: true, default: ''},
    email: {type: String, trim: true, default: ''},
    password: {type: String},
    languages: {type: Array, trim: true, default: []},
    activeLanguage: {type: String, trim: true, default: ''},
    activeDictionary: {type: String, trim: true, default: ''}
})

/*Statics*/
/**
 * Joi Validate
 * @type {{firstName: *, lastName: *, email: *, password: *}}
 */
UserSchema.statics.joiValidate = {
    firstName: Joi.string().alphanum().min(1).max(100),
    lastName: Joi.string().alphanum().min(1).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(1)
}

/**
 * Add language
 * @param id
 * @param payload
 * @returns {*}
 */
UserSchema.statics.addLanguage = async function(id, payload) {
    const acceptedFields = ['name', 'longName']
    const data = _.pick(payload, acceptedFields)
    data.slug = util.slug(payload.name)
    data.dictionaries = []

    const user = await this.findById({_id: id})
    const languages = _.filter(user.languages, {slug: data.slug})

    if(languages.length) { /*duplicate*/
        const errMessage = `this language ${languages[0].name} already exist`
        return Boom.badData(errMessage)
    }

    return await this.update({_id: id}, {$push: {languages: data}})
}


/*Methods*/
/**
 * Verify Password
 * @param password
 * @returns {boolean}
 */
UserSchema.methods.verifyPassword = function(password) {
    return this.password === md5(password)
}

/*Hooks*/
UserSchema.pre('save', function(next) {
    if(this.password) {
        this.password = md5(this.password)
    }
    next()
})

/*Export*/
const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel