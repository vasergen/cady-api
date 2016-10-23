'use strict'

const routes = require('./routes')
const dbConnect = require('./lib/dbConnect')
const serverStart = require('./lib/serverStart')
const logger = require('./lib/logger')
const cachify = require('./lib/cachify').cachify
const baseSchema = require('./models/baseSchema')
const User = require('./models/user')
const mongoose = require('./lib/pmongoose')
const _ = require('lodash')

const db = dbConnect() /*mongoose connect*/
const server = serverStart((err, server) => { /*server register callback*/
    if (err) throw err

    server.route(routes) /*add routes to app*/

    /*let's cachify our models*/
    //_.forEach(mongoose.models, (Model) => {
    //    cachify(server, Model)
    //})

    cachify(server, User) //TODO: rewrite to use all models
})

server.on('response', function (request) {
    const message =
        request.info.remoteAddress + ': ' + request.method.toUpperCase()
        + ' ' + request.url.path + ' --> ' + request.response.statusCode

    logger.info(message)
})

