'use strict'

const Hapi = require('hapi')
const config = require("config")

const port = config.get('server.port')
const server = new Hapi.Server()

server.connection({port})
server.start((err) => {
    if(err) throw err

    console.log(`server running at: ${server.info.uri}`)
})