export = Through;
declare const Through_base: any;
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
declare class Through extends Through_base {
    constructor(options?: Object | Function, transform?: Function, flush?: Function);

    static through(options?: Object | Function, transform?: Function, flush?: Function): Through;

    /**
     * Shortcut for object mode
     *
     * @param {Object} [options] - Stream options
     * @param {Function} transform - Function called on transform
     * @param {Function} flush - Function called on flush
     */
    static throughObj(options?: Object | Function, transform?: Function, flush?: Function): Through;
}
