#!/usr/bin/env deno run --allow-read --allow-write --allow-env --allow-net --allow-run
// Usage: ./make.js command. Use -l to list commands.
// This is a set of tasks for building and testing SheetKeys in development.
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std@0.136.0/path/mod.ts";
import { desc, run, task } from "https://deno.land/x/drake@v1.5.1/mod.ts";
import * as shoulda from "./tests/vendor/shoulda.js";
import JSON5 from "https://deno.land/x/json5/mod.ts";

const projectPath = new URL(".", import.meta.url).pathname;

async function shell(procName, argsArray = []) {
  // NOTE(philc): Does drake's `sh` function work on Windows? If so, that can replace this function.
  if (Deno.build.os == "windows") {
    // if win32, prefix arguments with "/c {original command}"
    // e.g. "mkdir c:\git\sheetkeys" becomes "cmd.exe /c mkdir c:\git\sheetkeys"
    optArray.unshift("/c", procName)
    procName = "cmd.exe"
  }
  const p = Deno.run({ cmd: [procName].concat(argsArray) });
  const status = await p.status();
  if (!status.success)
    throw new Error(`${procName} ${argsArray} exited with status ${status.code}`);
}

// Builds a zip file for submission to the Chrome and Firefox stores. The output is in dist/.
async function buildStorePackage() {
  // TODO(philc): Assert that manifest.json doesn't include an "options_page" key. That is used for debugging
  // purposes and shouldn't make it into a release build.
  const excludeList = [
    "*.md",
    ".*",
    "CREDITS",
    "MIT-LICENSE.txt",
    "dist",
    "make.js",
    "harnesses",
    "tests",
  ];
  const fileContents = await Deno.readTextFile("./manifest.json");
  // Chrome's manifest.json supports comment syntax, so use the JSON5 library to parse this file.
  const manifestContents = JSON5.parse(fileContents);
  const rsyncOptions = ["-r", ".", "dist/sheetkeys"].concat(
    ...excludeList.map((item) => ["--exclude", item])
  );
  const sheetkeysVersion = manifestContents["version"];
  // cd into "dist/sheetkeys" before building the zip, so that the files in the zip don't each have the
  // path prefix "dist/sheetkeys".
  // --filesync ensures that files in the archive which are no longer on disk are deleted. It's equivalent to
  // removing the zip file before the build.
  const zipCommand = "cd dist/sheetkeys && zip -r --filesync ";

  await shell("rm", ["-rf", "dist/sheetkeys"]);
  await shell("mkdir", ["-p", "dist/sheetkeys", "dist/chrome-store"]);
  await shell("rsync", rsyncOptions);

  // Build the Chrome Store package.
  await shell("bash",
              ["-c", `${zipCommand} ../chrome-store/sheetkeys-chrome-store-${sheetkeysVersion}.zip .`]);
}

const runUnitTests = async () => {
  // Import every test file.
  const dir = path.join(projectPath, "tests/unit/");
  const files = Array.from(Deno.readDirSync(dir)).map((f) => f.name).sort();
  for (let f of files) {
    if (f.endsWith("_test.js")) {
      await import(path.join(dir, f));
    }
  }

  await shoulda.run();
};

desc("Run tests");
task("test", [], async () => {
  await runUnitTests();
});

desc("Builds a zip file for submission to the Chrome store. The output is in dist/");
task("package", [], async () => {
  await buildStorePackage();
});

run();
