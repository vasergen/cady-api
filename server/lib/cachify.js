'use strict'

const md5 = require('md5')
const _ = require('lodash')
const logger = require('./logger')
const util = require('./util')

function _getCache(server, options) {
    const cache = server.cache(options)

    function get(key) {
        return new Promise((resolve, reject) => {
            cache.get(key, (err, value /*cached, log*/) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }

    function set(key, value) {
        return new Promise((resolve, reject) => {
            cache.set(key, value, null, (err) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }

    return {
        get: get,
        set: set
    }
}

function _getMd5Key(value) {
    let result = ''
    if(_.isString(value)) {
        result = value
    } else if(_.isObject(value)) {
        try {
            result = JSON.stringify(value)
        } catch(err) {
            logger.error(err)
        }
    } else {
        logger.warn('_getMd5Key', value)
    }

    return md5(result)
}

function _cachify (cache, Model, method) {
    return function _findOne() {
        const findBy = _.take(arguments)
        const modelName = util.getModelName(Model)

        let isCashed = false

        return new Promise((resolve, reject) => {
            const key = _getMd5Key({modelName: modelName, find: findBy})
            cache.get(key)
                .then((cachedInstance) => {
                    if(cachedInstance) {
                        isCashed = true
                        return cachedInstance
                    }
                    return Model[method].apply(Model, findBy)
                })
                .then((instanse) => {
                    if(!isCashed) {
                        cache.set(key, instanse)
                    }
                    let res = isCashed ? new Model(instanse) : instanse
                    return resolve(res)
                })
                .catch((err) => {
                    logger.error(err)
                    return reject(err)
                })
        })
    }
}

/**
 * Let's add findOneCache and findCache to our models and use hapi cashing there
 * @param server
 * @param Query
 */
function cachify(server, Model) {
    const cache = _getCache(server, {
        segment: 'db',
        expiresIn: 10 * 60000 /*60000 ms == 1 minute*/
    })

    Model.findOneCache = _cachify(cache, Model, 'findOne')
    Model.findCache = _cachify(cache, Model, 'find')

    return Model
}

module.exports = {
    /*private*/
    _cachify,
    _getCache,

    /*public*/
    cachify
}
