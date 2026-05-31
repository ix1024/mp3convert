#!/usr/bin/env node
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import readline from "readline";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);
const suggested = `${major}.${minor}.${patch + 1}`;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(`当前版本 ${pkg.version}，新版本 (默认 ${suggested}): `, (answer) => {
  rl.close();
  const version = answer.trim() || suggested;

  pkg.version = version;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`版本更新为 ${version}`);

  console.log("构建中...");
  execFileSync("npm", ["run", "build"], { stdio: "inherit" });

  console.log("发布中...");
  execFileSync("npm", ["publish", "--access", "public"], { stdio: "inherit" });
});
