'use strict'

const routes = require('./routes')
const dbConnect = require('./lib/dbConnect')
const serverStart = require('./lib/serverStart')
const logger = require('./lib/logger')

const db = dbConnect()
const server = serverStart()

server.route(routes)

server.on('response', function (request) {
    const message =
        request.info.remoteAddress + ': ' + request.method.toUpperCase()
        + ' ' + request.url.path + ' --> ' + request.response.statusCode

    logger.info(message)
});

