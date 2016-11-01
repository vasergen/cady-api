'use strict'

/**
 * Get cache object
 * @param server
 * @param options
 * @returns {{get: get, set: set}}
 * @private
 */
class Cache {
    constructor(server, options) {
        this.cache = server.cache(options)
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.cache.get(key, (err, value /*cached, log*/) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            this.cache.set(key, value, null, (err) => {
                if(err) {
                    return reject(err)
                }

                return resolve(value)
            })
        })
    }
}

module.exports = Cache