if (~process.version.indexOf('v0.8.')) {
	'Readable,Writable,Transform,Duplex'.split(',').forEach(function(p){
		require('stream')[p] = require('readable-stream')[p];
	});
}
