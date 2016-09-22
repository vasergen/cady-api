'use strict'

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
    },
    {
        method: 'GET',
        path: '/user',
        config: {
            handler: UserCreate,
            description: 'Create new user',
            tags: ['api']
        }
    }
]

module.exports = routes

//Handlers

function GetHello(request, reply) {
    reply('Hello!')
}

function GetHelloAsd(request, reply) {
    reply('Hello! asd')
}

function UserCreate(request, reply) {
    let User = require('./schemes/user')
    let user = new User({
        firstName: 'Igor',
        email: 'vasergen@gmail.com'
    })

    user.save()
        .then((data) => {
            reply(data)
        })
}