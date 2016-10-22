'use strict'

const mongoose = require('../lib/pmongoose')
const BaseSchema = require('./baseSchema')
const Joi = require('joi')

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
*           longName: 'Polish',
*           dictionaries: [
*               56asd345asadaad,
*               56asd3454ffh6h6
*           ]
*       },
*       {
*           name: 'sp',
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

//Mongo Schema
const UserSchema = BaseSchema({
    firstName: {type: String, trim: true, default: ''},
    lastName: {type: String, trim: true, default: ''},
    email: {type: String, trim: true, default: ''},
    password: {type: String},
    languages: {type: Array, trim: true, default: []},
    activeLanguage: {type: String, trim: true, default: ''},
    activeDictionary: {type: String, trim: true, default: ''}
})

UserSchema.statics.joiValidate = {
    firstName: Joi.string().alphanum().min(1).max(100),
    lastName: Joi.string().alphanum().min(1).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(1)
}

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel