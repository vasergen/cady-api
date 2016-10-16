'use strict'

const logger = require('winston')
const config = require('config')

logger.level = config.get('logLevel')
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, {'timestamp':true, colorize: true})
logger.addColors({
    info: 'blue',
    error: 'red',
    warn: 'yellow',
    debug: 'green'
})

module.exports = logger