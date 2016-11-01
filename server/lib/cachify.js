'use strict'

const _ = require('lodash')
const logger = require('./logger')
const util = require('./util')
const Cache = require('./cache')

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
    const cache = new Cache(server, {
        segment: util.getModelName(Model),
        expiresIn: 10 * 60000 /*60000 ms == 1 minute*/
    })

    Model.findOneCache = _cachify(cache, Model, 'findOne')
    Model.findCache = _cachify(cache, Model, 'find')

    return Model
}

module.exports = {
    /*private*/
    _cachify,

    /*public*/
    cachify
}
