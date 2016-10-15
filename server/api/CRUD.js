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


//Put
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


//DELETE
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

//COUNT
function COUNT(Model) {
    return function countHandler(request, reply) {
        Model.count({})
            .then((responce) => {
                reply(responce)
            })
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function countPath(Model) {
    const modelName = getModelName(Model)
    return {
        path: `/${modelName}/count`, method: 'GET', handler: COUNT(Model), config: {
            description: `Return count instances in ${modelName} model`,
            tags: ['api'],
            validate: {}
        }
    }
}

//LIST

function LIST(Model) {
    return function findHandler(request, reply) {
        const limit = request.query.limit
        const offset = request.query.offset

        Model.find({})
            .limit(limit)
            .skip(offset)
            .then((responce) => {
                reply(responce)
            })
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function listPath(Model) {
    const modelName = getModelName(Model)

    return {
        path: `/${modelName}/list`, method: 'GET', handler: LIST(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: {
                    limit: Joi.number().integer().min(1).max(1000).default(10),
                    offset: Joi.number().integer().min(0).default(0)
                }
            }
        }
    }
}

function CRUD(Model) {
    const post = postPath(Model)
    const get_ = getPath(Model)
    const put = putPath(Model)
    const delete_ = deletePath(Model)
    const count = countPath(Model)
    const list = listPath(Model)

    //return routes for Hapi
    return [
        post,
        get_,
        put,
        delete_,
        count,
        list
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