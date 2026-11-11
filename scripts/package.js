// Builds zip files for submission to the Chrome and Firefox stores. The output is in dist/.
import * as manifest from "./manifest.js";

// Runs a program as a subprocess, inheriting stdio, and throws if it fails.
async function exec(program, args) {
  const command = new Deno.Command(program, { args, stdout: "inherit", stderr: "inherit" });
  const status = await command.output();
  if (!status.success) {
    throw new Error(`${program} ${args.join(" ")} exited with status ${status.code}`);
  }
}

const excludeList = [
  "*.md",
  ".*",
  "CREDITS",
  "MIT-LICENSE.txt",
  "deno.json",
  "deno.lock",
  "dist",
  "dprint.json",
  "scripts",
  "harnesses",
  "tests",
];

const chromeManifest = await manifest.read();

// Ensure the manifest does not contain the options_page key. That is only used in development.
if (chromeManifest["options_page"]) {
  throw new Error(
    "The 'options_page' key in manifest.json should be commented out. It's used only in " +
      "develompent for testing purposes.",
  );
}

await Deno.remove("dist/sheetkeys", { recursive: true }).catch((error) => {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
});
for (const dir of ["dist/sheetkeys", "dist/chrome-store", "dist/firefox"]) {
  await Deno.mkdir(dir, { recursive: true });
}
const rsyncExcludes = excludeList.flatMap((item) => ["--exclude", item]);
await exec("rsync", ["-r", ".", "dist/sheetkeys", ...rsyncExcludes]);

const version = chromeManifest["version"];
const writeDistManifest = (manifestObject) =>
  Deno.writeTextFile("dist/sheetkeys/manifest.json", JSON.stringify(manifestObject, null, 2));

// Zips dist/sheetkeys into `zipPath`, which is relative to dist/sheetkeys. The zip is built from
// within dist/sheetkeys, so that the files in it don't each have the path prefix "dist/sheetkeys".
// --filesync ensures that files in the archive which are no longer on disk are deleted. It's
// equivalent to removing the zip file before the build.
const zip = (zipPath) =>
  exec("bash", ["-c", `cd dist/sheetkeys && zip -r --filesync ${zipPath} .`]);

// Build the Firefox package
await writeDistManifest(manifest.toFirefox(chromeManifest));
await zip(`../firefox/sheetkeys-firefox-${version}.zip`);

// Build the Chrome Store package.
await writeDistManifest(chromeManifest);
await zip(`../chrome-store/sheetkeys-chrome-store-${version}.zip`);
