'use strict'

const util = require('util')
const _ = require('lodash')

function inspect(obj) {
    /*eslint no-console: ["error", { allow: ["log"] }]*/

    console.log(util.inspect(obj, { showHidden: false, depth: 1 }))
}

function getMongoIdRegexp () {
    return /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
}

function getModelName(Model) {
    return _.lowerCase(Model.modelName)
}

function getModelSchema(Model) {
    return Model.schema.obj
}

function getAllModelFields(Model) {
    return _.keys(Model.schema.paths)
}

function getSchemaModelFields(Model) {
    return _.keys(getModelSchema(Model))
}

module.exports = {
    inspect,
    getMongoIdRegexp,
    getModelName,
    getModelSchema,
    getAllModelFields,
    getSchemaModelFields
}