'use strict'

const mongoose = require('../lib/pmongoose.js')

let BaseSchema = function(schema, options) {
    let baseSchema = {
        /*to be ...*/
    }

    let baseOptions = {
        timestamps: true
    }

    return mongoose.Schema(
        Object.assign({}, baseSchema, schema),
        Object.assign({}, baseOptions, options)
    )
}

module.exports = BaseSchema