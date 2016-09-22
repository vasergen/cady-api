'use strict'

const Hapi = require('hapi')
const config = require('config')
const logger = require('./lib/logger')
const routes = require('./routes')
const Pack = require('./../package')
const dbConnect = require('./lib/dbConnect')

const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')

const port = config.get('port')
const host = config.get('host')

const server = new Hapi.Server()

const options = {
    info: {
        'title': 'API Documentation',
        'version': Pack.version
    }
}

server.connection({host, port})
const db = dbConnect()

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