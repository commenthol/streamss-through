/**
 * @copyright (c) 2014- commenthol
 * @licence MIT
 */

'use strict';

var util = require('util'),
	Transform = require('streamss-shim').Transform,
	extend = util._extend;

/// wrappers for sync mode
var wrap = {
	transform: function(fn) {
		return function (chunk, enc, done) {
			fn.call(this, chunk, enc);
			done();
		};
	},
	flush: function(fn) {
		return function (done) {
			fn.call(this);
			done();
		};
	}
};

/**
 * Stream transformer with functional API
 * 
 * @param {Object} options : Stream options 
 * @param {Boolean} options.objectMode: Whether this stream should behave as a stream of objects. Default=false
 * @param {Number} options.highWaterMark: The maximum number of bytes to store in the internal buffer before ceasing to read from the underlying resource. Default=16kb
 * @param {String} options.encoding: set encoding for string-decoder
 * @param {Boolean} options.decodeStrings: do not decode strings if set to `false`
 * @param {Function} transform : function called on transform
 * @param {Function} flush : function called on flush
 */
function Through(options, transform, flush) {
	if (!(this instanceof Through)) {
		return new Through(options, transform, flush);
	}
	
	if (typeof options === 'function') {
		flush = transform;
		transform = options;
		options = {};
	}

	options = options || {};
	Transform.call(this, options);
	
    if (typeof transform !== 'function') {
		transform = function(){};
	}
    if (typeof flush !== 'function') {
		flush = null;
	}

	this._transform = transform;
	this._flush = flush;

	if (this._transform.length < 3) {
		this._transform = wrap.transform.call(this, transform);
	}
	if (this._flush && this._flush.length < 1) {
		this._flush = wrap.flush.call(this, flush);
	}

	return this;
}

util.inherits(Through, Transform);

/**
 * Shortcut for object mode
 * 
 * @param {Object} options
 * @param {Function} transform
 * @param {Function} flush
 */
Through.obj = function (options, transform, flush) {
	if (typeof options === 'function') {
		flush = transform;
		transform = options;
		options = {};
	}
	options = extend({ objectMode: true }, options);
	return new Through(options, transform, flush);
};

module.exports = Through;
