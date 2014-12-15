/**
 * @copyright (c) 2014- commenthol
 * @licence MIT
 */

'use strict';

/*global describe, it*/

var fs = require('fs'),
	assert = require('assert'),
	util = require('util'),
	Readable = require('streamss-shim').Readable,
	Through = require('../index');

var testTxt = __dirname + '/test.txt';

/// a simple read stream
function Reader(options, read){
	if (!(this instanceof Reader)) {
		return new Reader(options, read);
	}
	Readable.call(this, options);
	this._read = read;
	return this;
}
util.inherits(Reader, Readable);

/// tests
describe('#Through', function(){

	it('with new operator', function(){
		var through = new Through();
		assert.ok(through instanceof Through);
	});

	it('without new operator', function(){
		var through = Through();
		assert.ok(through instanceof Through);
	});

	it('no functions', function(testDone){
		var through = Through(),
			rs = fs.createReadStream(testTxt);

		rs
			.pipe(through)
			.on('end', function(){
				testDone();
			})
			.pipe(process.stdout);
	});

	it('only flush - sync mode', function(testDone){
		var rs = fs.createReadStream(testTxt);

		rs
			.pipe(Through(
				function transform() {},
				function flush() {
					testDone();
				}
			));
	});

	it('only flush - async mode', function(testDone){
		var rs = fs.createReadStream(testTxt);

		rs
			.pipe(Through(
				function transform() {},
				function flush(done) {
					done();
					testDone();
				}
			));
	});

	it('push through - sync mode', function(testDone){
		var cnt = 0,
			rs = fs.createReadStream(testTxt);

		rs
			.pipe(Through(
				function transform(chunk) { // synchronous type - no `done()` required
					// count newlines
					chunk.toString().replace(/\n/g, function(m){
						cnt += 1;
					});

					this.push(chunk);
				},
				function flush() {
					assert.equal(cnt, 12);
					testDone();
				}
			));
	});

	it('push through - async mode', function(testDone){
		var cnt = 0,
			rs = fs.createReadStream(testTxt);

		rs
			.pipe(Through(
				{ encoding: 'utf8' }, // work with strings only
				function(chunk) {
					this.push(chunk);
				}
			))
			.pipe(Through(
				{ decodeStrings: false },
				function transform(chunk, enc, done) { // synchronous type - no `done()` required
					var self = this;

					assert.equal(typeof chunk, 'string');
					assert.equal(enc, 'utf8');

					// count newlines
					chunk.replace(/\n/g, function(m){
						cnt += 1;
					});
					setTimeout(function() {
						self.push(chunk);
						done();
					}, 5);
				},
				function flush(done) {
					assert.equal(cnt, 12);
					done();
					testDone();
				}
			));
	});

	it('object mode', function(testDone){
		var cnt = 0;
		var arr = [
			{ 0: "zero" },
			{ 1: "one" },
			{ 2: "two" },
			{ 3: "three" }
		];
		var read = function(){
			var self = this;
			arr.forEach(function(obj){
				self.push(obj);
			});
			self.push(null);
		};

		(Reader({objectMode: true}, read))
			.pipe(Through.obj(
					function(data) {
						assert.equal(data[cnt], arr[cnt][cnt]);
						cnt += 1;
					}
				)
			)
			.on('finish', function(){
				assert.equal(cnt, arr.length);
				testDone();
			});
	});

	it('throw error', function(testDone){
		var cnt = 0;
		var read = function(){
			for (var i=0; i<100; i++) {
				this.push(i + "");
			}
			this.push(null);
		};

		(Reader({}, read))
			.pipe(Through(
				function transform(chunk) {
					this.push(chunk);
					cnt+=1;
					if (cnt === 10) {
						this.emit('error', new Error('bang'));
					}
				}
			))
			.pipe(Through(
				function transform(chunk) {
					this.push(chunk);
				}
			))
			.on('error', function(err){
				assert.equal(err.message, 'bang');
				testDone();
			});
	});

	it('throw error passError=false', function(testDone){
		var cnt = 0;
		var reached = false;
		var read = function(){
			for (var i=0; i<100; i++) {
				this.push(i + "");
			}
			this.push(null);
		};

		(Reader({}, read))
			.pipe(Through(
				function transform(chunk) {
					this.push(chunk);
					cnt+=1;
					if (cnt === 10) {
						this.emit('error', new Error('bang'));
					}
				}
			))
			.on('error', function(err){
				assert.equal(err.message, 'bang');
				setTimeout(function(){
					assert.ok(reached === true);
					testDone();
				}, 10);

			})
			.pipe(Through(
				{ passError: false },
				function transform(chunk) {
					reached = true;
					//~ console.log(chunk.toString(), reached)
					assert.ok(chunk.toString() < 10);
				}
			));
	});

});
