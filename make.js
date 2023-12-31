#!/usr/bin/env deno run --allow-read --allow-write --allow-env --allow-net --allow-run
// Usage: ./make.js command. Use -l to list commands.
// This is a set of tasks for building and testing SheetKeys in development.
import * as path from "https://deno.land/std@0.136.0/path/mod.ts";
import { desc, run, task } from "https://deno.land/x/drake@v1.5.1/mod.ts";
import * as shoulda from "https://deno.land/x/shoulda@v2.0/shoulda.js";
import JSON5 from "https://deno.land/x/json5@v1.0.0/mod.ts";

const projectPath = new URL(".", import.meta.url).pathname;

async function shell(procName, argsArray = []) {
  // NOTE(philc): Does drake's `sh` function work on Windows? If so, that can replace this function.
  if (Deno.build.os == "windows") {
    // if win32, prefix arguments with "/c {original command}"
    // e.g. "mkdir c:\git\sheetkeys" becomes "cmd.exe /c mkdir c:\git\sheetkeys"
    optArray.unshift("/c", procName);
    procName = "cmd.exe";
  }
  const p = Deno.run({ cmd: [procName].concat(argsArray) });
  const status = await p.status();
  if (!status.success) {
    throw new Error(`${procName} ${argsArray} exited with status ${status.code}`);
  }
}

function createFirefoxManifest(manifest) {
  manifest = JSON.parse(JSON.stringify(manifest)); // Deep clone.

  // As of 2023-07-08 Firefox doesn't yet support background.service_worker.
  delete manifest.background["service_worker"];
  Object.assign(manifest.background, {
    "scripts": ["background_script.js"],
  });

  Object.assign(manifest, {
    "browser_specific_settings": {
      "gecko": {
        // This ID was generated by the Firefox store upon first submission. It's needed in
        // development mode, or many extension APIs don't work.
        "id": "sheetkeys@github.com",
        "strict_min_version": "112.0",
      },
    },
  });

  return manifest;
}

async function parseManifestFile() {
  // Chrome's manifest.json supports JavaScript comment syntax. However, the Chrome Store rejects
  // manifests with JavaScript comments in them! So here we use the JSON5 library, rather than JSON
  // library, to parse our manifest.json and remove its comments.
  return JSON5.parse(await Deno.readTextFile("./manifest.json"));
}

// Builds a zip file for submission to the Chrome and Firefox stores. The output is in dist/.
async function buildStorePackage() {
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

  const chromeManifest = await parseManifestFile();

  // Ensure the manifest does not contain the options_page key. That is only used in development.
  if (chromeManifest["options_page"]) {
    throw new Error(
      "The 'options_page' key in manifest.json should be commented out. It's used only in " +
        "develompent for testing purposes.",
    );
  }

  await shell("rm", ["-rf", "dist/sheetkeys"]);
  await shell("mkdir", ["-p", "dist/sheetkeys", "dist/chrome-store", "dist/firefox"]);
  const rsyncOptions = ["-r", ".", "dist/sheetkeys"].concat(
    ...excludeList.map((item) => ["--exclude", item]),
  );
  await shell("rsync", rsyncOptions);

  const version = chromeManifest["version"];
  const writeDistManifest = async (manifestObject) => {
    await Deno.writeTextFile(
      "dist/sheetkeys/manifest.json",
      JSON.stringify(manifestObject, null, 2),
    );
  };

  // cd into "dist/sheetkeys" before building the zip, so that the files in the zip don't each have
  // the path prefix "dist/sheetkeys".
  // --filesync ensures that files in the archive which are no longer on disk are deleted. It's
  // equivalent to removing the zip file before the build.
  const zipCommand = "cd dist/sheetkeys && zip -r --filesync ";

  // Build the Firefox package
  const firefoxManifest = createFirefoxManifest(chromeManifest);
  await writeDistManifest(firefoxManifest);
  await shell("bash", ["-c", `${zipCommand} ../firefox/sheetkeys-firefox-${version}.zip .`]);

  // Build the Chrome Store package.
  writeDistManifest(chromeManifest);
  await shell("bash", [
    "-c",
    `${zipCommand} ../chrome-store/sheetkeys-chome-store-${version}.zip .`,
  ]);
}

const runUnitTests = async () => {
  // Import every test file.
  const dir = path.join(projectPath, "tests/unit/");
  const files = Array.from(Deno.readDirSync(dir)).map((f) => f.name).sort();
  for (const f of files) {
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

desc("Replaces manifest.json with a Firefox-compatible version, for development");
task("write-firefox-manifest", [], async () => {
  const firefoxManifest = createFirefoxManifest(await parseManifestFile());
  await Deno.writeTextFile("./manifest.json", JSON.stringify(firefoxManifest, null, 2));
});

run();
