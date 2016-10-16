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

function getSelectObjForFieldsInUrl(Model, request) {
    const urlFieldsStr = _.get(request.query, 'fields', '')
    const urlFields = urlFieldsStr.split(',').filter(value => value)

    //exit if empty fields query in url
    const result = {}
    if(!urlFields.length) {
        logger.debug(getSelectObjForFieldsInUrl.name, JSON.stringify(result))
        return result
    }

    const modelFields = util.getAllModelFields(Model)

    _.forEach(modelFields, (field) => {
        if(_.includes(urlFields, field)) {
            result[field] = 1
        }

        else if(_.includes(urlFields, `-${field}`)) {
            result[field] = 0
        }
    })

    logger.debug(getSelectObjForFieldsInUrl.name, JSON.stringify(result))
    return result
}

function getQueryObjForFieldsInUrl(Model, request) {
    const fields = _.keys(Model.joiValidate)
    const queryDb = {}

    _.forEach(fields, (field) => {
        if(request.query[field] === '') {
            return
        }

        queryDb[field] = request.query[field]
    })

    logger.debug(getQueryObjForFieldsInUrl.name, JSON.stringify(queryDb))
    return queryDb
}

function getValidateObjForFieldsInUrl(Model) {
    const joiValidate = _.assign({}, Model.joiValidate)
    const result = {}

    _.forEach(joiValidate, (value, key) => {
        result[key] = value.default('')
    })

    logger.debug(getValidateObjForFieldsInUrl.name + ' keys:', _.keys(result)) //debug
    return result
}

//POST
function POST(Model) {
    return function postHandler (request, reply) {
        logger.debug(postHandler.name)

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
        logger.debug(getHandler.name)

        const id = request.params.id
        const select = getSelectObjForFieldsInUrl(Model, request)

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
    return function putHandler(request, reply) {
        logger.debug(putHandler.name)

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
        logger.debug(deleteHandler.name)

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
        logger.debug(countHandler.name)

        const queryObj = getQueryObjForFieldsInUrl(Model, request)
        Model.count(queryObj)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function countPath(Model) {
    const modelName = util.getModelName(Model)
    const validateFields = getValidateObjForFieldsInUrl(Model)

    return {
        path: `/${modelName}/count`, method: 'GET', handler: COUNT(Model), config: {
            description: `Return count instances in ${modelName} model`,
            tags: ['api'],
            validate: {
                query: validateFields
            }
        }
    }
}

//LIST
function LIST(Model) {
    return function listHandler(request, reply) {
        logger.debug(listHandler.name)

        const limit = request.query.limit
        const offset = request.query.offset
        const select = getSelectObjForFieldsInUrl(Model, request)

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
        logger.debug(findHandler.name)

        const limit = request.query.limit
        const offset = request.query.offset

        const queryObj = getQueryObjForFieldsInUrl(Model, request)
        const select = getSelectObjForFieldsInUrl(Model, request)

        return Model.find(queryObj)
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
    const validateFields = getValidateObjForFieldsInUrl(Model)

    return {
        path: `/${modelName}/find`, method: 'GET', handler: FIND(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: _.assign({}, validateFields, {
                    limit: JoiLimit(),
                    offset: JoiOffset(),
                    fields: JoiFields()
                })
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