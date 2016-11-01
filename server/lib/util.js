'use strict'

const logger = require('./logger')
const sysUtil = require('util')
const _ = require('lodash')
const md5 = require('md5')
const mongooseUtils = require('./../../node_modules/mongoose/lib/utils.js')

/**
 * Print to console object using util.inspect function.
 * It helps debug big object where a lot of properties
 * @param obj
 */
function inspect(obj) {
    /*eslint no-console: ["error", { allow: ["log"] }]*/
    console.log(sysUtil.inspect(obj, { showHidden: false, depth: 1 }))
}

/**
 * Return regexp object to check mongo id
 * @returns {RegExp}
 */
function getMongoIdRegexp () {
    return /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
}

/**
 * Return model name
 * @param Model
 * @returns {String}
 */
function getModelName(Model) {
    return _.lowerCase(Model.modelName)
}

/**
 * Return collection name from Model. If collection name didn't set explicitly it actually return pluralization form
 * of model name
 * @param Model
 * @returns {String}
 */
function getCollectionName(Model) {
    const toCollectionName = mongooseUtils.toCollectionName
    const modelName = getModelName(Model)

    let collection

    if(Model.schema.options.collection) {
        collection = Model.schema.options.collection
    } else {
        collection = toCollectionName(modelName)
    }

    return _.toLower(collection)
}

/**
 * Return Model Schema
 * @param Model
 * @returns {*}
 */
function getModelSchema(Model) {
    return Model.schema.obj
}

/**
 * Return array of all fields of Model, including _id, _v and so on. So basically it should return exactly the same
 * fields that are in database collection
 * @param Model
 */
function getAllModelFields(Model) {
    return _.keys(Model.schema.paths)
}

/**
 * Return array of fields from Model Schema
 * @param Model
 */
function getSchemaModelFields(Model) {
    return _.keys(getModelSchema(Model))
}

function joiValidateAddRequired(joiRules, requiredFields) {
    let validateRules = {}

    _.forEach(joiRules, (rule, field) => {
        if(requiredFields.indexOf(field) !== -1) {
            validateRules[field] = rule.required()
            return
        }

        validateRules[field] = rule
    })

    return validateRules
}

function getMd5(value) {
    let result = ''
    if(_.isString(value)) {
        result = value
    } else if(_.isObject(value)) {
        try {
            result = JSON.stringify(value)
        } catch(err) {
            logger.error(err)
        }
    } else {
        logger.warn('getMd5Key expect value as string or object', value)
    }

    return md5(result)
}

function tryCatch(fn, catchFn) {
    const original = fn

    return function decorated() {
        try {
            return original.apply(fn, arguments)
        } catch (err) {
            if(catchFn) {
                catchFn.call(fn, err)
            } else {
                logger.error(err)
                throw err
            }
        }
    }
}

module.exports = {
    inspect,
    getMongoIdRegexp,
    getModelName,
    getCollectionName,
    getModelSchema,
    getAllModelFields,
    getSchemaModelFields,
    joiValidateAddRequired,
    getMd5,
    tryCatch
}