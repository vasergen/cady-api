'use strict'

const mongoose = require('./pmongoose.js')
const logger = require('./logger')
const config = require('config')

module.exports = function dbConnection() {
    mongoose.connect(config.get('db'))
    const db = mongoose.connection

    db.on('error', _mongoError)
    db.once('open', _mongoOnceOpen)

    return db
}

function _mongoError(err) {
    logger.error(err)
}

function _mongoOnceOpen() {
    logger.info('connected to database!')
}