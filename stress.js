var join = require('path').join
var spawn = require('child_process').spawn

var which = require('which')

var node = process.execPath
var tap = which.sync('tap')
var cmd = [tap, '--reporter', 'classic', join(__dirname, 'test.js')]

var failures = 0
var iterations = 20

function runTap (remaining) {
  var iteration = iterations - remaining + 1
  if (remaining < 1) {
    console.log('ok')
    console.log(
      '# %d/%d failed (%d%)',
      failures, iterations,
      Math.round((failures / iterations) * 100)
    )
    console.log('1..%d', iterations)
    return
  }

  console.log('# run', iteration)
  var stderr = ''
  var stdout = ''
  var child = spawn(node, cmd, {})

  if (child.stderr) {
    child.stderr.on('data', function (chunk) {
      stderr += chunk
    })
  }

  if (child.stdout) {
    child.stdout.on('data', function (chunk) {
      stdout += chunk
    })
  }

  child.on('error', function (err) {
    console.error(err.stack)
  })

  child.on('close', function (code) {
    if (code !== 0) {
      failures++
      console.log('not ok ', iteration, '- error: tap returned', code)
      console.log('1..%s', iteration)
      if (stdout !== '') console.error(stdout)
      if (stderr !== '') console.error(stderr)
      return
    } else {
      console.log('ok', iteration, 'no problems')
    }

    runTap(remaining - 1)
  })
}

console.log('TAP version 13')
runTap(iterations)
