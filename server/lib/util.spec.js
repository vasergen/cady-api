'use strict'

const expect = require('chai').expect
const mongoose = require('mongoose')
const util = require('./util')
const sinon = require('sinon')
const Joi = require('joi')

describe('inspect', () => {
    it('should run util.inspect', () => {
        const nodeUtil = require('util')
        nodeUtil.inspect = sinon.spy()

        util.inspect({})
        const called = nodeUtil.inspect.called
        expect(called).to.equal(true)
    })
})

describe('getMongoIdRegexp', () => {
    it('shuld return regext to check mongo id', () => {
        const regexp = util.getMongoIdRegexp()

        expect(regexp.test('58027e6d9ded484bd1af104d')).to.equal(true)
    })

    it('shuld return regext to check mongo id', () => {
        const regexp = util.getMongoIdRegexp()
        expect(regexp.test('badId')).to.equal(false)
    })
})

describe('getModelName', () => {
    it('should return model name', () => {
        const Schema = mongoose.Schema({})
        const Model = mongoose.model('User', Schema)

        let modelName = util.getModelName(Model)
        expect(modelName).to.equal('user')
    })

    afterEach(() => {
        delete mongoose.models.User
        delete mongoose.modelSchemas.User
    })
})

describe('getCollectionName', () => {
    it('should return collection name', () => {
        const Schema = mongoose.Schema({})
        const Model = mongoose.model('User', Schema)
        const collectionName = util.getCollectionName(Model)

        expect(collectionName).to.equal('users')
    })

    it('should return collection name when collection name was set via options', () => {
        const Schema = mongoose.Schema({}, {collection: 'user'})
        const Model = mongoose.model('User', Schema)
        const collectionName = util.getCollectionName(Model)

        expect(collectionName).to.equal('user')
    })

    it('should return collection name when collection name was set', () => {
        const Schema = mongoose.Schema({})
        Schema.set('collection', 'user')
        const Model = mongoose.model('User', Schema)
        const collectionName = util.getCollectionName(Model)

        expect(collectionName).to.equal('user')
    })

    afterEach(() => {
        delete mongoose.models.User
        delete mongoose.modelSchemas.User
    })
})

describe('getModelSchema', () => {
    it('should return model schema', () => {
        const modelSchema = {name: {type: String}}
        const Schema = mongoose.Schema(modelSchema)
        const Model = mongoose.model('User', Schema)
        const result = util.getModelSchema(Model)

        expect(result).to.deep.equal(modelSchema)
    })

    afterEach(() => {
        delete mongoose.models.User
        delete mongoose.modelSchemas.User
    })
})

describe('getAllModelFields', () => {
    it('at least should return _id', () => {
        const modelSchema = {name: {type: String}}
        const Schema = mongoose.Schema(modelSchema)
        const Model = mongoose.model('User', Schema)

        const fields = util.getAllModelFields(Model)
        const hasId = fields.indexOf('_id') !== -1

        expect(hasId).to.equal(true)
    })

    afterEach(() => {
        delete mongoose.models.User
        delete mongoose.modelSchemas.User
    })
})

describe('getSchemaModelFields', () => {
    it('should return fields from schema', () => {
        const modelSchema = {name: {type: String}}
        const Schema = mongoose.Schema(modelSchema)
        const Model = mongoose.model('User', Schema)

        const fields = util.getSchemaModelFields(Model)
        const expected = ['name']

        expect(fields).to.deep.equal(expected)
    })

    afterEach(() => {
        delete mongoose.models.User
        delete mongoose.modelSchemas.User
    })
})

describe('addRequiredToJoiRulesObj', () => {
    const joiValidateAddRequired = util.joiValidateAddRequired

    it('should add required to required fields', () => {
        const joiRules = {
            firstName: Joi.string(),
            email: Joi.string(),
            password: Joi.string()
        }

        const requiredFields = ['email', 'password']
        const joiRequired = joiValidateAddRequired(joiRules, requiredFields)

        expect(joiRequired.firstName._flags.presence).to.equal(undefined)
        expect(joiRequired.email._flags.presence).to.equal('required')
        expect(joiRequired.password._flags.presence).to.equal('required')
    })
})


