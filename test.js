var join = require('path').join
var randomBytes = require('crypto').randomBytes
var spawn = require('child_process').spawn

var once = require('once')
var rimraf = require('rimraf')
var test = require('tap').test
var which = require('which')

var npmBin = which.sync('npm')
var tarBin = which.sync('tar')
var cacheBase = join(__dirname, 'caches')
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

function genCache () {
  return join(cacheBase, randomBytes(8).toString('hex'))
}

function findInPackageTarball (path, opts, cb) {
  cb = once(cb)
  var cmd = ['tfz', path, 'package/index.js']
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

function testBySubdirName (t, subdirName) {
  var cache = genCache()
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
      t.notOk(stderr, 'no error output')
      var tarballName = stdout.trim()
      var tarballPath = join(__dirname, subdirName, tarballName)
      findInPackageTarball(
        tarballPath,
        {},
        function (err, code, stdout, stderr) {
          if (err) throw err
          t.is(stdout, 'package/index.js\n')
          t.notOk(stderr)
          t.equal(code, 0, 'tar found index.js')
          rimraf.sync(tarballPath)
          t.end()
        }
      )
    }
  )
}

test('index-in-main', function (t) { testBySubdirName(t, 'index-in-main') })
test('index-in-main', function (t) { testBySubdirName(t, 'index-in-files') })
test('index-in-main', function (t) { testBySubdirName(t, 'index-in-main-and-files') })

test('cleanup', function (t) {
  rimraf.sync(cacheBase)
  t.end()
})
