/**
 * @module streamss-through
 * @copyright 2014- commenthol
 * @licence MIT
 */

'use strict'

const { Transform } = require('stream')

// / wrappers for sync mode
const wrap = {
  transform: function (fn) {
    return function (chunk, enc, done) {
      fn.call(this, chunk, enc)
      done()
    }
  },
  flush: function (fn) {
    return function (done) {
      fn.call(this)
      done()
    }
  }
}

/**
 * Stream transformer with functional API
 *
 * @constructor
 * @param {Object} [options] - Stream options
 * @param {Boolean} options.objectMode - Whether this stream should behave as a stream of objects. Default=false
 * @param {Number} options.highWaterMark - The maximum number of bytes to store in the internal buffer before ceasing to read from the underlying resource. Default=16kb
 * @param {String} options.encoding - Set encoding for string-decoder
 * @param {Boolean} options.decodeStrings - Do not decode strings if set to `false`. Default=true
 * @param {Boolean} options.passError - Pass error to next pipe. Default=true
 * @param {Function} [transform] - Function called on transform
 * @param {Function} [flush] - Function called on flush
 */
class Through extends Transform {
  constructor (options, transform, flush) {
    if (typeof options === 'function') {
      flush = transform
      transform = options
      options = {}
    }
    options = options || {}
    super(options)

    if (typeof transform !== 'function') {
      transform = function (data, encoding, done) {
        this.push(data)
        done()
      }
    }
    if (typeof flush !== 'function') {
      flush = null
    }

    this._transform = transform
    this._flush = flush

    if (this._transform.length < 3) {
      this._transform = wrap.transform.call(this, transform)
    }
    if (this._flush && this._flush.length < 1) {
      this._flush = wrap.flush.call(this, flush)
    }

    this.on('pipe', (src) => {
      if (options.passError !== false) {
        src.on('error', (err) => {
          this.emit('error', err)
        })
      }
    })
  }

  static through (...args) {
    return new Through(...args)
  }

  /**
   * Shortcut for object mode
   *
   * @param {Object} [options] - Stream options
   * @param {Function} transform - Function called on transform
   * @param {Function} flush - Function called on flush
   */
  static throughObj (options, transform, flush) {
    // istanbul ignore else
    if (typeof options === 'function') {
      flush = transform
      transform = options
      options = {}
    }
    options = Object.assign({ objectMode: true }, options)
    return new Through(options, transform, flush)
  }
}

module.exports = Through
