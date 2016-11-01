'use strict'

const _ = require('lodash')
const logger = require('./logger')
const util = require('./util')

/**
 * Get cache object
 * @param server
 * @param options
 * @returns {{get: get, set: set}}
 * @private
 */
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

function _cachify (cache, Model, method) {
    return function _findCache() {
        const findBy = _.take(arguments)
        const modelName = util.getModelName(Model)

        return new Promise(async (resolve, reject) => {
            try {
                const key = util.getMd5({modelName: modelName, find: findBy})

                let modelObject = await cache.get(key)
                if(!modelObject) {
                    const instance = await Model[method].apply(Model, findBy)
                    modelObject = instance.toObject()
                    cache.set(key, modelObject)
                }
                return resolve(new Model(modelObject))
            } catch(err) {
                logger.error(err)
                return reject(err)
            }
        })
    }
}

/**
 * Let's add methods findOneCache and findCache to our models and use hapi cashing there
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
