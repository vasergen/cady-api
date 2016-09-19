'use strict'

const Hapi = require('hapi')
const config = require('config')
const logger = require('./logger')

const port = config.get('server.port')
const server = new Hapi.Server()

server.connection({port})
server.start(startServer)

/**
 * Start Hapi server
 * @param err
 */
function startServer(err) {
    if(err) throw err

    logger.log('info', `server running at: ${server.info.uri}`)
}