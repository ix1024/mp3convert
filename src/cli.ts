
import readline from "readline";
import path from "path";
import chalk from "chalk";
import { execFileSync } from "child_process";
import { runConvert } from "./core/converter";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function tryPickFolder(prompt: string, defaultVal: string): string | null {
  try {
    const script = [
      `set f to choose folder with prompt "${prompt}" default location (POSIX file "${defaultVal}" as alias)`,
      `POSIX path of f`
    ].join("\n");
    return execFileSync("osascript", ["-e", script], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e: any) {
    // 用户点了取消
    if (e.stderr?.includes("User canceled") || e.message?.includes("User canceled")) return null;
    // 系统权限被拒或其它错误，降级到文字输入
    return undefined as any;
  }
}

function askDir(question: string, defaultVal: string): Promise<string> {
  const hint = chalk.dim(`(默认: ${defaultVal})`);
  return new Promise((resolve) => {
    rl.question(`${question} ${hint}: `, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function pickFolder(label: string, prompt: string, defaultVal: string): Promise<string> {
  console.log(`选择${label}...`);
  const result = tryPickFolder(prompt, defaultVal);
  if (result === null) {
    // 用户取消了弹窗，改为文字输入
    console.log(chalk.yellow(`已取消，请手动输入${label}`));
    return askDir(label, defaultVal);
  }
  if (result === undefined) {
    // 权限被拒，提示用户并降级
    console.log(chalk.yellow(`无法弹出文件夹选择（系统权限被拒），请手动输入路径`));
    console.log(chalk.dim("提示: 系统偏好设置 → 隐私与安全 → 自动化 → 允许 Terminal"));
    return askDir(label, defaultVal);
  }
  return result;
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

  const input = await pickFolder("输入目录", "选择要转换的文件夹", process.cwd());
  console.log(chalk.dim(`输入: ${input}`));

  const defaultOutput = path.join(process.cwd(), "converted");
  const output = await pickFolder("输出目录", "选择保存 MP3 的文件夹", defaultOutput);
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
