'use strict'

const _ = require('lodash')
const logger = require('./../lib/logger')
const util = require('./../lib/util')
const Joi = require('joi')

function getModelName(Model) {
    return _.lowerCase(Model.modelName)
}

//POST
function POST(Model) {
    return function createHandler (request, reply) {
        let data = request.payload
        let user = new Model(data)

        user.save()
            .then(reply)
            .catch((err) => {
                reply(err)
                logger.error(err)
            })
    }
}

//GET
function GET(Model) {
    return function getHandler(request, reply) {
        let id = request.params.id

        Model.findById(id)
            .then((data) => {
                reply(data)
            })
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

//Update
function PUT(Model) {
    return function updateHandler(request, reply) {
        const id = request.params.id
        const data = request.payload
        const options = {
            new: true //Note: by default it is false
        }

        Model.findByIdAndUpdate(id, data, options)
            .then((responce) => {
                reply(responce)
            })
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function DELETE(Model) {
    return function deleteHandler(request, reply) {
        const id = request.params.id

        Model.remove({_id: id})
            .then((responce) => {
                reply(responce)
            })
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function postPath(Model) {
    const modelName = getModelName(Model)

    return {
        path: `/${modelName}`, method: 'POST', handler: POST(Model), config: {
            description: `Create new ${modelName}`,
            tags: ['api'],
            validate: {
                payload: Model.joiValidate
            }
        }
    }
}

function getPath(Model) {
    const modelName = getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'GET', handler: GET(Model), config: {
            description: `Get ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                }
            }
        }
    }
}

function putPath(Model) {
    const modelName = getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'PUT', handler: PUT(Model), config: {
            description: `Update ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                },
                payload: Model.joiValidate
            }
        }
    }
}

function deletePath(Model) {
    const modelName = getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'DELETE', handler: DELETE(Model), config: {
            description: `Delete ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                },
                payload: Model.joiValidate
            }
        }
    }
}

function CRUD(Model) {
    const post = postPath(Model)
    const get_ = getPath(Model)
    const put = putPath(Model)
    const delete_ = deletePath(Model)

    return [
        post,
        get_,
        put,
        delete_
    ]
}

module.exports = {
    CRUD,
    getModelName,
    POST,
    GET,
    PUT,
    postPath,
    getPath,
    putPath,
    deletePath
}