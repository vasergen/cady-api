'use strict'

const logger = require('./logger')
const config = require('config')
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Pack = require('./../../package')

const Documentation = {
    'register': HapiSwagger,
    'options': {
        info: {
            'title': 'API Documentation',
            'version': Pack.version
        }
    }
}

const modules = [
    Inert,
    Vision,
    Documentation
]

module.exports = serverStart


function serverStart() {
    const server = new Hapi.Server()
    const port = config.get('port')
    const host = config.get('host')

    server.connection({host, port})

    server.register(modules, (err) => {
        if(err) throw err

        server.start((err) => {
            if(err) throw err

            logger.info(`server running at: ${server.info.uri}`)
        })
    })

    return server
}