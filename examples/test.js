var Through = require('..')
var cnt = 0

require('fs').createReadStream(__filename, { encoding: 'utf8', highWaterMark: 30 })
  .pipe(Through(
    { decodeStrings: false },
    function transform (str) {
      cnt += 1
      this.push(str.replace(/\s/g, '‧') + '\n')
    },
    function flush () {
      console.log('\ncounted num of chunks: ' + cnt)
    }
  ))
  .pipe(process.stdout)
