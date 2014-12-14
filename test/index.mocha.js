/**
 * @copyright (c) 2014- commenthol
 * @licence MIT
 */

'use strict';

/*global describe, it*/

require('../shim');

var fs = require('fs'),
	assert = require('assert'),
	util = require('util'),
	Readable = require('stream').Readable,
	Through = require('../index');

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
			rs = fs.createReadStream(__dirname + '/test.txt');

		rs
			.pipe(through)
			.on('end', function(){
				testDone();
			})
			.pipe(process.stdout);
	});

	it('only flush - sync mode', function(testDone){
		var rs = fs.createReadStream(__dirname + '/test.txt');

		rs
			.pipe(Through(
				function transform() {},
				function flush() {
					testDone();
				}
			));
	});

	it('only flush - async mode', function(testDone){
		var rs = fs.createReadStream(__dirname + '/test.txt');

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
			rs = fs.createReadStream(__dirname + '/test.txt');

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
			rs = fs.createReadStream(__dirname + '/test.txt');

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
		var arr = [
			{ 0: "zero" },
			{ 1: "one" },
			{ 2: "two" },
			{ 3: "three" }
		];
		var cnt = 0;
		
		function Reader(){
			Readable.call(this, {objectMode: true});
		}
		util.inherits(Reader, Readable);
		Reader.prototype._read = function(){
			var self = this;
			arr.forEach(function(obj){
				self.push(obj);
			});
			self.push(null);
		};
		
		(new Reader())
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
	
});
