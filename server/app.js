'use strict'

const Hapi = require('hapi')
const config = require('config')
const logger = require('./logger')
const routes = require('./routes')
const Pack = require('./../package')

const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')

const port = config.get('server.port')
const host = config.get('server.host')

const server = new Hapi.Server()

const options = {
    info: {
        'title': 'API Documentation',
        'version': Pack.version
    }
}

server.connection({host, port})

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }],
    (err) => {
        if(err) throw err

        server.start(startServerCallback)
    }
)

server.route(routes)

/**
 * Start Hapi server
 * @param err
 */
function startServerCallback(err) {
    if(err) throw err

    logger.info(`server running at: ${server.info.uri}`)
}