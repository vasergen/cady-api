'use strict'

const routes = require('./routes')
const dbConnect = require('./lib/dbConnect')
const serverStart = require('./lib/serverStart')

const db = dbConnect()
const server = serverStart()

server.route(routes)


