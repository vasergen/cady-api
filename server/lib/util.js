'use strict'

const util = require('util')

function inspect(obj) {
    /*eslint no-console: ["error", { allow: ["log"] }] */

    console.log(util.inspect(obj, false, null))
}

function getMongoIdRegexp () {
    return /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
}

module.exports = {
    inspect,
    getMongoIdRegexp
}