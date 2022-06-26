#!/usr/bin/env deno run --allow-read --allow-write --allow-env --allow-net --allow-run
// Usage: ./make.js command. Use -l to list commands.
// This is a set of tasks for building and testing SheetKeys in development.
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std@0.136.0/path/mod.ts";
import { desc, run, task } from "https://deno.land/x/drake@v1.5.1/mod.ts";
import * as shoulda from "./tests/vendor/shoulda.js";

const projectPath = new URL(".", import.meta.url).pathname;

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

await runUnitTests();
