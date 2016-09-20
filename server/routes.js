'use strict'

function GetHello(request, reply) {
    reply('Hello!')
}

function GetHelloAsd(request, reply) {
    reply('Hello! asd')
}

let routes = [
    {
        method: 'GET',
        path: '/',
        config: {
            handler: GetHello,
            description: 'Returns a hello string',
            notes: 'Returns a hello string asd',
            tags: ['api']
        }
    },
    {
        method: 'GET',
        path: '/asd',
        config: {
            handler: GetHelloAsd,
            description: 'Returns another hello string',
            tags: ['api']
        }
    }
]

module.exports = routes