'use strict'

const mongoose = require('mongoose')
const Promise = require('bluebird')
const config = require('config')

Promise.promisifyAll(mongoose)

const logLevel = config.get('logLevel')

if(['silly', 'debug'].indexOf(logLevel) !== -1) {
    mongoose.set('debug', true)
}

module.exports = mongoose