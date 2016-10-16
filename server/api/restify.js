'use strict'

const _ = require('lodash')
const logger = require('./../lib/logger')
const util = require('./../lib/util')
const Joi = require('joi')

function _JoiLimit() {
    return Joi.number().integer()
        .min(1).max(1000)
        .default(10)
        .description('limit. min = 1, max = 1000')
}

function _JoiOffset() {
    return Joi.number().integer()
        .min(0)
        .default(0)
        .description('offset. min = 0')
}

function _JoiFields() {
    const description =
        'You can include or exclude fields in response. Fields should be separated by colon. ' +
        'To exclude field, just add in front of it -, for example: <code>-firstName,-lastname</code>'

    return Joi.string().regex(/^[a-zA-Z0-9_,]+$/)
        .default('')
        .description(description)
}

function _getSelectObjForFieldsInUrl(Model, request) {
    const urlFieldsStr = _.get(request.query, 'fields', '')
    const urlFields = urlFieldsStr.split(',').filter(value => value)

    //exit if empty fields query in url
    const result = {}
    if(!urlFields.length) {
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

    return result
}

function _getQueryObjForFieldsInUrl(Model, request) {
    const fields = _.keys(Model.joiValidate)
    const queryDb = {}

    _.forEach(fields, (field) => {
        let fieldValue = request.query[field]

        if(fieldValue === '' || fieldValue === undefined) {
            return
        }

        queryDb[field] = request.query[field]
    })

    return queryDb
}

//POST
function _POST(Model) {
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

function _postRoute(Model) {
    const modelName = util.getModelName(Model)

    return {
        path: `/${modelName}`, method: 'POST', handler: _POST(Model), config: {
            description: `Create new ${modelName}`,
            tags: ['api'],
            validate: {
                payload: Model.joiValidate
            }
        }
    }
}

//GET
function _GET(Model) {
    return function getHandler(request, reply) {
        logger.debug(getHandler.name)

        const id = request.params.id
        const select = _getSelectObjForFieldsInUrl(Model, request)

        Model.findById(id)
            .select(select)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function _getRoute(Model) {
    const modelName = util.getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'GET', handler: _GET(Model), config: {
            description: `Get ${modelName} instance by id`,
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().regex(idRegexp)
                },
                query: {
                    fields: _JoiFields()
                }
            }
        }
    }
}


//Put
function _PUT(Model) {
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

function _putRoute(Model) {
    const modelName = util.getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'PUT', handler: _PUT(Model), config: {
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
function _DELETE(Model) {
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

function _deleteRoute(Model) {
    const modelName = util.getModelName(Model)
    const idRegexp = util.getMongoIdRegexp()

    return {
        path: `/${modelName}/{id}`, method: 'DELETE', handler: _DELETE(Model), config: {
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
function _COUNT(Model) {
    return function countHandler(request, reply) {
        logger.debug(countHandler.name)

        const queryObj = _getQueryObjForFieldsInUrl(Model, request)
        Model.count(queryObj)
            .then(reply)
            .catch((err) =>{
                reply(err)
                logger.error(err)
            })
    }
}

function _countRoute(Model) {
    const modelName = util.getModelName(Model)

    return {
        path: `/${modelName}/count`, method: 'GET', handler: _COUNT(Model), config: {
            description: `Return count instances in ${modelName} model`,
            tags: ['api'],
            validate: {
                query: Model.joiValidate
            }
        }
    }
}

//LIST
function _LIST(Model) {
    return function listHandler(request, reply) {
        logger.debug(listHandler.name)

        const limit = request.query.limit
        const offset = request.query.offset
        const select = _getSelectObjForFieldsInUrl(Model, request)

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

function _listRoute(Model) {
    const modelName = util.getModelName(Model)

    return {
        path: `/${modelName}/list`, method: 'GET', handler: _LIST(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: {
                    limit: _JoiLimit(),
                    offset: _JoiOffset(),
                    fields: _JoiFields()
                }
            }
        }
    }
}

//FIND
function _FIND(Model) {
    return function findHandler(request, reply) {
        logger.debug(findHandler.name)

        const limit = request.query.limit
        const offset = request.query.offset

        const queryObj = _getQueryObjForFieldsInUrl(Model, request)
        const select = _getSelectObjForFieldsInUrl(Model, request)

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

function _findRoute(Model) {
    const modelName = util.getModelName(Model)

    return {
        path: `/${modelName}/find`, method: 'GET', handler: _FIND(Model), config: {
            description: `Return list of ${modelName} instances`,
            tags: ['api'],
            validate: {
                query: _.assign({}, Model.joiValidate, {
                    limit: _JoiLimit(),
                    offset: _JoiOffset(),
                    fields: _JoiFields()
                })
            }
        }
    }
}

function restify(Model) {
    const post = _postRoute(Model)
    const get_ = _getRoute(Model)
    const put = _putRoute(Model)
    const delete_ = _deleteRoute(Model)
    const count = _countRoute(Model)
    const list = _listRoute(Model)
    const find = _findRoute(Model)

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
    /*private methods*/
    _JoiLimit,
    _JoiOffset,
    _JoiFields,
    _getSelectObjForFieldsInUrl,
    _getQueryObjForFieldsInUrl,
    _POST,
    _postRoute,
    _GET,
    _getRoute,
    _PUT,
    _putRoute,
    _DELETE,
    _deleteRoute,
    _COUNT,
    _countRoute,
    _LIST,
    _listRoute,
    _FIND,
    _findRoute,

    /*public methods*/
    restify
}