'use strict'

const util = require('util')
const _ = require('lodash')
const mongooseUtils = require('./../../node_modules/mongoose/lib/utils.js')

/**
 * Print to console object using util.inspect function.
 * It helps debug big object where a lot of properties
 * @param obj
 */
function inspect(obj) {
    /*eslint no-console: ["error", { allow: ["log"] }]*/
    console.log(util.inspect(obj, { showHidden: false, depth: 1 }))
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

module.exports = {
    inspect,
    getMongoIdRegexp,
    getModelName,
    getCollectionName,
    getModelSchema,
    getAllModelFields,
    getSchemaModelFields
}