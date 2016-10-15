'use strict'

const mongoose = require('../lib/pmongoose.js')

/**
 * Return mongoose Schema with some default changes
 * @param schema
 * @param options
 * @returns {*}
 * @constructor
 */
function BaseSchema(schema, options) {
    const baseSchema = {
        /*to be ...*/
    }

    const baseOptions = {
        timestamps: true
    }

    const Schema = mongoose.Schema(
        Object.assign({}, baseSchema, schema),
        Object.assign({}, baseOptions, options)
    )

    //Add joiValidate
    Schema.statics.joiValidate = {}

    return Schema
}

module.exports = BaseSchema