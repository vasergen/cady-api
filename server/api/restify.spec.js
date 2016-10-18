'use strict'

const expect = require('chai').expect
const restify = require('./restify')
const Joi = require('joi')
const mongoose = require('./../lib/pmongoose')

describe('_JoiLimit', () => {
    let limit
    let schema

    beforeEach(() => {
        limit = restify._JoiLimit()
        schema = {limit: limit}
    })

    it('should have default value', () => {
        Joi.validate({}, schema, (err, value) => {
            expect(value.limit).to.exist
        })
    })

    it('should validate integer', () => {
        Joi.validate({limit: '123'}, schema, (err) => {
            expect(err).to.be.null
        })
    })

    it('should be error on non integer string', () => {
        Joi.validate({limit: 'asd'}, schema, (err) => {
            expect(err).not.to.be.null
        })
    })
})

describe('_JoiOffset', () => {
    let offset
    let schema

    beforeEach('', () => {
        offset = restify._JoiOffset()
        schema = {offset: offset}
    })

    it('should have default property', () => {
        Joi.validate({}, schema, (err, value) => {
            expect(value.offset).to.exist
        })
    })

    it('should validate an integer', () => {
        Joi.validate({offset: '123'}, {offset: offset}, (err) => {
            expect(err).to.be.null
        })
    })

    it('should not validate validate non integer string', () => {
        Joi.validate({offset: 'asd123'}, {offset: offset}, (err) => {
            expect(err).not.to.be.null
        })
    })
})

describe('_JoiFields', () => {
    let fields
    let schema

    beforeEach(() => {
        fields = restify._JoiFields()
        schema = {fields: fields}
    })

    it('by default should be empty string', () => {
        Joi.validate({}, schema, (err, value) => {
            expect(value.fields).to.equal('')
        })
    })

    it('should validate words separated by semicolon', () => {
        Joi.validate({fields: 'firstname,lastname'}, schema, (err) => {
            expect(err).to.be.null
        })
    })

    it('should not validate if there are space', () => {
        Joi.validate({fields: 'firstname, lastname'}, schema, (err) => {
            expect(err).not.to.be.null
        })
    })
})

describe('_getSelectObjFromFieldsInUrl', () => {
    let Model
    let _getSelectObjFromFieldsInUrl
    let Schema = mongoose.Schema({
        firstName: { type: String},
        lastName: { type: String},
        email: { type: String}
    })
    Model = mongoose.model('TestModel', Schema)

    beforeEach(() => {
        _getSelectObjFromFieldsInUrl = restify._getSelectObjFromFieldsInUrl
    })

    it('should return selectObj', () => {
        let request = {query: {fields: 'firstName,-lastName,email,notExistField'}}
        let result = _getSelectObjFromFieldsInUrl(Model, request)

        let expected = {
            firstName: 1,
            lastName: 0,
            email: 1
        }

        expect(result).to.deep.equal(expected)
    })

    it('should return empty object', () => {
        let request = {query: {fields: ''}}
        let result = _getSelectObjFromFieldsInUrl(Model, request)

        let expected = {}
        expect(result).to.deep.equal(expected)
    })
})

describe('_getQueryObjForFieldsInUrl', () => {
    let Model
    let _getQueryObjFromFieldsInUrl
    beforeEach(() => {
        _getQueryObjFromFieldsInUrl = restify._getQueryObjFromFieldsInUrl
        let Schema = mongoose.Schema({
            firstName: {type: String},
            lastName: {type: String},
            email: {type: String}
        })

        Model = mongoose.model('Test', Schema)
    })

    it('should return queryDb object', () => {
        let request = {query: {
            firstName: '',
            lastName: 'Lee',
            notExistField: 'notExistField'
        }}
        let result = _getQueryObjFromFieldsInUrl(Model, request)
        let expected = {
            lastName: 'Lee'
        }
        expect(result).to.deep.equal(expected)
    })
})