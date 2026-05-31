
import readline from "readline";
import path from "path";
import chalk from "chalk";
import { execFileSync } from "child_process";
import { runConvert } from "./core/converter";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function pickFolder(prompt: string, defaultVal: string): string {
  try {
    const script = [
      `set f to choose folder with prompt "${prompt}" default location (POSIX file "${defaultVal}" as alias)`,
      `POSIX path of f`
    ].join("\n");
    return execFileSync("osascript", ["-e", script], { encoding: "utf8" }).trim();
  } catch {
    return defaultVal;
  }
}

function askChoice(question: string, choices: string[], defaultIdx = 0): Promise<string> {
  const formatted = choices.map((c, i) => (i === defaultIdx ? chalk.cyan(`[${c}]`) : c)).join(" / ");
  return new Promise((resolve) => {
    rl.question(`${question} ${formatted}: `, (answer) => {
      const trimmed = answer.trim();
      const matched = choices.find(c => c.toLowerCase() === trimmed.toLowerCase());
      resolve(matched || choices[defaultIdx]);
    });
  });
}

function askNumber(question: string, defaultVal: number): Promise<number> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(Math.max(1, parseInt(answer.trim()) || defaultVal));
    });
  });
}

async function main() {
  console.log(chalk.bold("\n🎵 mp3convert\n"));

  console.log("选择输入目录...");
  const input = pickFolder("选择要转换的文件夹", process.cwd());
  console.log(chalk.dim(`输入: ${input}`));

  const defaultOutput = path.join(process.cwd(), "converted");
  console.log("选择输出目录...");
  const output = pickFolder("选择保存 MP3 的文件夹", defaultOutput);
  console.log(chalk.dim(`输出: ${output}`));

  const quality = await askChoice("音质", ["128k", "192k", "320k"], 1);

  const parallel = await askNumber(`并发数 (默认: ${chalk.cyan("2")}): `, 2);

  rl.close();

  console.log(chalk.dim(`\n输入: ${input}`));
  console.log(chalk.dim(`输出: ${output}`));
  console.log(chalk.dim(`音质: ${quality}  并发: ${parallel}\n`));

  await runConvert({ input, output, quality, parallel });
}

main();
