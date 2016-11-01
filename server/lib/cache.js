'use strict'

/**
 * Get cache object
 * @param server
 * @param options
 * @returns {{get: get, set: set}}
 * @private
 */
function Cache(server, options) {
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

module.exports = Cache