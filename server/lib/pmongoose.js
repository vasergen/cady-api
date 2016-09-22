'use strict'

const mongoose = require('mongoose')
const Promise = require('bluebird')
Promise.promisifyAll(mongoose)

module.exports = mongoose