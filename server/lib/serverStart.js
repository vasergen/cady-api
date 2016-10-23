'use strict'

const logger = require('./logger')
const config = require('config')
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Pack = require('./../../package')
const hapiAuthBasic = require('hapi-auth-basic')
const basicAuth = require('./../api/basicAuth')
const User = require('./../models/user')

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
    Documentation,
    hapiAuthBasic
]

function serverStart(cb) {
    const port = config.get('port')
    const host = config.get('host')

    const server = new Hapi.Server()
    server.connection({host, port})

    server.register(modules, (err) => {
        if(err) throw err

        const validation = basicAuth.basicValidation(server, User)
        /*setup basic auth as a default strategy by all routes*/
        server.auth.strategy('default', 'basic', true, { validateFunc: validation })

        cb && cb(null, server)

        server.start((err) => {
            if(err) throw err

            logger.info(`server running at: ${server.info.uri}`)
        })
    })

    return server
}

module.exports = serverStart