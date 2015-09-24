util = require "util"
fs = require "fs"
path = require "path"
child_process = require "child_process"

spawn = (procName, optArray, silent = false, sync = false) ->
  if process.platform is "win32"
    # if win32, prefix arguments with "/c {original command}"
    # e.g. "coffee -c c:\git\sheetkeys" becomes "cmd.exe /c coffee -c c:\git\sheetkeys"
    optArray.unshift "/c", procName
    procName = "cmd.exe"
  if sync
    proc = child_process.spawnSync procName, optArray, {
      stdio: [undefined, process.stdout, process.stderr]
    }
  else
    proc = child_process.spawn procName, optArray
    unless silent
      proc.stdout.on "data", (data) -> process.stdout.write data
      proc.stderr.on "data", (data) -> process.stderr.write data
  proc

optArrayFromDict = (opts) ->
  result = []
  for key, value of opts
    if value instanceof Array
      result.push "--#{key}=#{v}" for v in value
    else
      result.push "--#{key}=#{value}"
  result

# visitor will get passed the file path as a parameter
visitDirectory = (directory, visitor) ->
  fs.readdirSync(directory).forEach (filename) ->
    filepath = path.join directory, filename
    if (fs.statSync filepath).isDirectory()
      return visitDirectory filepath, visitor

    return unless (fs.statSync filepath).isFile()
    visitor(filepath)

task "build", "compile all coffeescript files to javascript", ->
  coffee = spawn "coffee", ["-c", __dirname]
  coffee.on "exit", (returnCode) -> process.exit returnCode

task "clean", "removes any js files which were compiled from coffeescript", ->
  visitDirectory __dirname, (filepath) ->
    return unless (path.extname filepath) == ".js"

    directory = path.dirname filepath

    # Check if there exists a corresponding .coffee file
    try
      coffeeFile = fs.statSync path.join directory, "#{path.basename filepath, ".js"}.coffee"
    catch _
      return

    fs.unlinkSync filepath if coffeeFile.isFile()

task "autobuild", "continually rebuild coffeescript files using coffee --watch", ->
  coffee = spawn "coffee", ["-cw", __dirname]

task "package", "Builds a zip file for submission to the Chrome store. The output is in dist/", ->
  version = JSON.parse(fs.readFileSync("manifest.json").toString())["version"]

  invoke "build"

  spawn "rm", ["-rf", "dist/sheetkeys"], false, true
  spawn "mkdir", ["-p", "dist/sheetkeys"], false, true

  blacklist = [".*", "*.coffee", "*.md", "tests", "dist", "git_hooks",
               "node_modules", "Cakefile"]
  rsyncOptions = [].concat.apply(
    ["-r", ".", "dist/sheetkeys"],
    blacklist.map((item) -> ["--exclude", "#{item}"]))

  spawn "rsync", rsyncOptions, false, true
  spawn "zip", ["-r", "dist/sheetkeys-#{version}.zip", "dist/sheetkeys"], false, true

runUnitTests = (projectDir=".", testNameFilter) ->
  console.log "Running unit tests..."
  basedir = path.join projectDir, "/tests/unit_tests/"
  test_files = fs.readdirSync(basedir).filter((filename) -> filename.indexOf("_test.js") > 0)
  test_files = test_files.map((filename) -> basedir + filename)
  test_files.forEach (file) -> require (if file[0] == '/' then '' else './') + file
  Tests.run(testNameFilter)
  return Tests.testsFailed
