# streamss-through

> A sync/async stream2 transformer

![NPM version](https://badge.fury.io/js/streamss-through.svg)
[![Build Status](https://secure.travis-ci.org/commenthol/streamss-through.svg?branch=master)](https://travis-ci.org/commenthol/streamss-through)

Works with node v0.8.x and greater.
For node v0.8.x the user-land copy [`readable-stream`][readable-stream] is used.
For all other node versions greater v0.8.x the built-in `stream` module is used.

`Through` can be used in synchronous mode with:

```javascript
process.stdin
	.pipe(Through(
		function transform (data){
			// synchronous mode
		},
		function flush (){
			// synchronous mode
		}
	))
```

or in asynchronous mode:

```javascript
	.pipe(Through(
		function transform (data, enc, done){
			// asynchronous mode
			done(); // explicit call of done required
		},
		function flush (done){
			// asynchronous mode
			done(); // explicit call of done required
		}
	))
```

## Through([options], transform, flush)

**Parameters:**

- `{Object} [options]` - Stream options
- `{Boolean} options.objectMode` - Whether this stream should behave as a stream of objects. Default=false
- `{Number} options.highWaterMark` - The maximum number of bytes to store in the internal buffer before ceasing to read from the underlying resource. Default=16kb
- `{String} options.encoding` - Set encoding for string-decoder
- `{Boolean} options.decodeStrings` - Do not decode strings if set to `false`. Default=true
- `{Boolean} options.passError` - Pass error to next pipe. Default=true
- `{Function} transform` - Function called on transform
- `{Function} flush` - Function called on flush

## Through.obj([options], transform, flush)

> Shortcut for object mode

**Parameters:**

- `{Object} [options]` - Stream options
- `{Function} transform` - Function called on transform
- `{Function} flush` - Function called on flush


### Example:

```javascript
var Through = require('streamss-through');
var cnt = 0;

require('fs').createReadStream(__filename, { encoding: 'utf8', highWaterMark: 30 })
	.pipe(Through(
		{ decodeStrings: false },
		function transform(str) {
			cnt += 1;
			this.push(str.replace(/\s/g, '‧') + '\n');
		},
		function flush() {
			console.log('\ncounted num of chunks: ' + cnt);
		}
	))
	.pipe(process.stdout);
```

Try it with:

```bash
npm run try
```

Check out the [tests](./test/index.mocha.js) for more examples.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work.

## License

Copyright (c) 2014-2015, Commenthol. (MIT License)

See [LICENSE][] for more info.

[LICENSE]: ./LICENSE
[readable-stream]: https://github.com/isaacs/readable-stream
