'use strict'

const _ = require('lodash')
const logger = require('./../lib/logger')
const util = require('./../lib/util')
const Joi = require('joi')

function JoiLimit() {
    return Joi.number().integer()
        .min(1).max(1000)
        .default(10)
        .description('limit. min = 1, max = 1000')
}

function JoiOffset() {
    return Joi.number().integer()
        .min(0)
        .default(0)
        .description('offset. min = 0')
}

function JoiFields() {
    const description =
        'You can include or exclude fields in response. Fields should be separated by colon. ' +
        'To exclude field, just add in front of it -, for example: <code>-firstName,-lastname</code>'

    return Joi.string().regex(/[a-zA-Z0-9_,]/)
        .default('')
        .description(description)
}

function selectFields(Model, request) {
    const urlFieldsStr = _.get(request.query, 'fields', '')
    const urlFields = urlFieldsStr.split(',').filter(value => value)

    //exit if empty fields query in url
    if(!urlFields.length) {
        return {}
    }

    const modelFields = util.getAllModelFields(Model)

    const result = {}
    _.forEach(modelFields, (field) => {
        if(_.includes(urlFields, field)) {
            result[field] = 1
        }

        else if(_.includes(urlFields, `-${field}`)) {
            result[field] = 0
        }
    })

    return result
}

function queryDbFromUrl(Model, request) {
    const fields = _.keys(Model.joiValidate)
    const queryDb = {}

    _.forEach(fields, (field) => {
        if(request.query[field] === '') {
            return
        }

        queryDb[field] = request.query[field]
    })

    return queryDb
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
    const modelName = util.getModelName(Model)

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
        const id = request.params.id
        const select = selectFields(Model, request)

        Model.findById(id)
            .select(select)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function getPath(Model) {
    const modelName = util.getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'GET', handler: GET(Model), config: {
            description: `Get ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                },
                query: {
                    fields: JoiFields()
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
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function putPath(Model) {
    const modelName = util.getModelName(Model)
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
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function deletePath(Model) {
    const modelName = util.getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'DELETE', handler: DELETE(Model), config: {
            description: `Delete ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                }
            }
        }
    }
}

//COUNT
function COUNT(Model) {
    return function countHandler(request, reply) {
        Model.count({})
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function countPath(Model) {
    const modelName = util.getModelName(Model)
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
        const select = selectFields(Model, request)

        Model.find({})
            .select(select)
            .limit(limit)
            .skip(offset)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function listPath(Model) {
    const modelName = util.getModelName(Model)

    return {
        path: `/${modelName}/list`, method: 'GET', handler: LIST(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: {
                    limit: JoiLimit(),
                    offset: JoiOffset(),
                    fields: JoiFields()
                }
            }
        }
    }
}

//FIND
function FIND(Model) {
    return function findHandler(request, reply) {
        const limit = request.query.limit
        const offset = request.query.offset

        const queryDb = queryDbFromUrl(Model, request)
        const select = selectFields(Model, request)

        Model.find(queryDb)
            .select(select)
            .limit(limit)
            .skip(offset)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function findPath(Model) {
    const modelName = util.getModelName(Model)

    //query params in url
    const queryUrl = {
        limit: JoiLimit(),
        offset: JoiOffset(),
        fields: JoiFields()
    }

    const joiValidate = _.assign({}, Model.joiValidate)

    _.forEach(joiValidate, (value, key) => {
        queryUrl[key] = value.default('')
    })

    return {
        path: `/${modelName}/find`, method: 'GET', handler: FIND(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: queryUrl
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
    const find = findPath(Model)

    //return routes for Hapi
    return [
        post,
        get_,
        put,
        delete_,
        count,
        list,
        find
    ]
}

module.exports = {
    CRUD,
    POST,
    GET,
    PUT,
    postPath,
    getPath,
    putPath,
    deletePath
}