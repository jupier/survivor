#!/usr/bin/env node

/**
 * Script to automatically bump the patch version in package.json
 * This is called by the pre-push git hook
 */

/* eslint-disable no-undef */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const packageJsonPath = join(process.cwd(), "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// Parse current version
const oldVersion = packageJson.version;
const [major, minor, patch] = oldVersion.split(".").map(Number);

// Bump patch version
const newVersion = `${major}.${minor}.${patch + 1}`;
packageJson.version = newVersion;

// Write updated package.json
writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + "\n",
  "utf-8"
);

console.log(`✓ Version bumped from ${oldVersion} to ${newVersion}`);

