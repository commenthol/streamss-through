/**
 * @copyright 2014- commenthol
 * @licence MIT
 */

'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const util = require('util')
const Readable = require('stream').Readable
const Through = require('../index')
const { through, throughObj } = Through

const testTxt = path.resolve(__dirname, 'test.txt')

// a simple read stream
function Reader (options, read) {
  if (!(this instanceof Reader)) {
    return new Reader(options, read)
  }
  Readable.call(this, options)
  this._read = read
  return this
}
util.inherits(Reader, Readable)

// tests
describe('#Through', function () {
  it('with new operator', function () {
    const through = new Through()
    assert.ok(through instanceof Through)
  })

  it('with static function', function () {
    const _through = through()
    assert.ok(_through instanceof Through)
  })

  it('no functions', function (testDone) {
    const rs = fs.createReadStream(testTxt)

    rs
      .pipe(through())
      .on('end', function () {
        testDone()
      })
      .pipe(through())
  })

  it('only flush - sync mode', function (testDone) {
    const rs = fs.createReadStream(testTxt)

    rs
      .pipe(through(
        function transform () {},
        function flush () {
          testDone()
        }
      ))
  })

  it('only flush - async mode', function (testDone) {
    const rs = fs.createReadStream(testTxt)

    rs
      .pipe(through(
        function transform () {},
        function flush (done) {
          done()
          testDone()
        }
      ))
  })

  it('push through - sync mode', function (testDone) {
    let cnt = 0
    const rs = fs.createReadStream(testTxt)

    rs
      .pipe(through(
        function transform (chunk) { // synchronous type - no `done()` required
        // count newlines
          chunk.toString().replace(/\n/g, function () {
            cnt += 1
          })

          this.push(chunk)
        },
        function flush () {
          assert.strictEqual(cnt, 12)
          testDone()
        }
      ))
  })

  it('push through - async mode', function (testDone) {
    let cnt = 0
    const rs = fs.createReadStream(testTxt)

    rs
      .pipe(through(
        { encoding: 'utf8' }, // work with strings only
        function (chunk) {
          this.push(chunk)
        }
      ))
      .pipe(through(
        { decodeStrings: false },
        function transform (chunk, enc, done) { // asynchronous type - `done()` required
          const self = this

          assert.strictEqual(typeof chunk, 'string')
          assert.strictEqual(enc, 'utf8')

          // count newlines
          chunk.replace(/\n/g, function () {
            cnt += 1
          })
          setTimeout(function () {
            self.push(chunk)
            done()
          }, 5)
        },
        function flush (done) {
          assert.strictEqual(cnt, 12)
          done()
          testDone()
        }
      ))
  })

  it('object mode', function (testDone) {
    let cnt = 0
    const arr = [
      { 0: 'zero' },
      { 1: 'one' },
      { 2: 'two' },
      { 3: 'three' }
    ]
    const read = function () {
      const self = this
      arr.forEach(function (obj) {
        self.push(obj)
      })
      self.push(null)
    };

    (Reader({ objectMode: true }, read))
      .pipe(throughObj(
        function (data) {
          assert.strictEqual(data[cnt], arr[cnt][cnt])
          cnt += 1
        }
      )
      )
      .on('finish', function () {
        assert.strictEqual(cnt, arr.length)
        testDone()
      })
  })

  it('throw error', function (testDone) {
    let cnt = 0
    const read = function () {
      for (let i = 0; i < 100; i++) {
        this.push(i + '')
      }
      this.push(null)
    };

    (Reader({}, read))
      .pipe(through(
        function transform (chunk) {
          this.push(chunk)
          cnt += 1
          if (cnt === 10) {
            this.emit('error', new Error('bang'))
          }
        }
      ))
      .pipe(through(
        function transform (chunk) {
          this.push(chunk)
        }
      ))
      .on('error', function (err) {
        assert.strictEqual(err.message, 'bang')
        testDone()
      })
  })

  it('throw error passError=false', function (testDone) {
    let cnt = 0
    let reached = false
    const read = function () {
      for (let i = 0; i < 100; i++) {
        this.push(i + '')
      }
      this.push(null)
    };

    (Reader({}, read))
      .pipe(through(
        function transform (chunk) {
          this.push(chunk)
          cnt += 1
          if (cnt === 10) {
            this.emit('error', new Error('bang'))
          }
        }
      ))
      .on('error', function (err) {
        assert.strictEqual(err.message, 'bang')
        setTimeout(function () {
          assert.ok(reached === true)
          testDone()
        }, 10)
      })
      .pipe(through(
        { passError: false },
        function transform (chunk) {
          reached = true
          // ~ console.log(chunk.toString(), reached)
          assert.ok(chunk.toString() < 10)
        }
      ))
  })

  it('write data', function (testDone) {
    const str = 'writing here'
    const stream = new Through()

    stream.pipe(through(function (data) {
      assert.strictEqual(data.toString(), str)
      testDone()
    }))

    stream.write(str)
  })
})
