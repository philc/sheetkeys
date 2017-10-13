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

task "package", "Builds a zip file for submission to the Chrome store. The output is in dist/", ->
  version = JSON.parse(fs.readFileSync("manifest.json").toString())["version"]

  spawn "rm", ["-rf", "dist/sheetkeys"], false, true
  spawn "mkdir", ["-p", "dist/sheetkeys"], false, true

  blacklist = [".*", "*.coffee", "*.md", "tests", "dist", "git_hooks",
               "node_modules", "Cakefile"]
  rsyncOptions = [].concat.apply(
    ["-r", ".", "dist/sheetkeys"],
    blacklist.map((item) -> ["--exclude", "#{item}"]))

  spawn "rsync", rsyncOptions, false, true
  spawn "zip", ["-r", "dist/sheetkeys-#{version}.zip", "dist/sheetkeys"], false, true
