var join = require('path').join
var spawn = require('child_process').spawn

var once = require('once')
var rimraf = require('rimraf')
var test = require('tap').test
var which = require('which')

var npmBin = which.sync('npm')
var tarBin = which.sync('tar')
var cache = join(__dirname, 'caches')
var npm_config_cache = join(__dirname, 'generic_cache')

// ripped from the headlines, by which I mean test/tap-common.js in the npm
// CLI tree
function npm (cmd, opts, cb) {
  cb = once(cb)
  cmd = [npmBin].concat(cmd)
  opts = opts || {}

  opts.env = opts.env || process.env
  if (!opts.env.npm_config_cache) {
    opts.env.npm_config_cache = npm_config_cache
  }

  var stdout = ''
  var stderr = ''
  var node = process.execPath
  var child = spawn(node, cmd, opts)

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

  child.on('error', cb)

  child.on('close', function (code) {
    cb(null, code, stdout, stderr)
  })
  return child
}

function findInPackageTarball (path, filename, opts, cb) {
  cb = once(cb)
  var cmd = ['tfz', path, 'package/' + filename]
  opts = opts || {}

  var stdout = ''
  var stderr = ''
  var child = spawn(tarBin, cmd, {})

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

  child.on('error', cb)

  child.on('close', function (code) {
    cb(null, code, stdout, stderr)
  })
  return child
}

function testBySubdirName (t, subdirName, filename) {
  npm(
    [
      '--cache', cache,
      '--loglevel', 'error',
      'pack'
    ],
    { cwd: join(__dirname, subdirName) },
    function (err, code, stdout, stderr) {
      if (err) throw err
      t.equal(code, 0, 'npm thinks it worked')
      t.equal(stderr, '', 'no error output')
      var tarballName = stdout.trim()
      if (!tarballName) t.bailout('not safe to proceed without tarball name')
      var tarballPath = join(__dirname, subdirName, tarballName)
      findInPackageTarball(
        tarballPath,
        filename,
        {},
        function (err, code, stdout, stderr) {
          if (err) throw err
          t.equal(
            code, 0,
            'tar found ' + filename + ' for ' + subdirName + ' scenario'
          )
          rimraf.sync(tarballPath)
        }
      )
    }
  )
}

test('run scenarios concurrently', function (t) {
  // 3 asserts per test, 5 tests
  t.plan(3 * 6)
  testBySubdirName(t, 'index-bare', 'index.js')
  testBySubdirName(t, 'index-in-main', 'index.js')
  testBySubdirName(t, 'nondex-in-main', 'nondex.js')
  testBySubdirName(t, 'index-in-files', 'index.js')
  testBySubdirName(t, 'nondex-in-files', 'nondex.js')
  testBySubdirName(t, 'index-in-main-and-files', 'index.js')
})

test('cleanup', function (t) {
  rimraf.sync(cache)
  t.end()
})
