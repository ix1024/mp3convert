
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { TaskQueue } from "./queue";
import { runFFmpeg } from "./ffmpeg";
import { ProgressManager } from "./progress";

function fmt(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

export async function runConvert(opts: any) {
  const input = opts.input;
  const output = opts.output || path.join(process.cwd(), "converted");

  fs.mkdirSync(output, { recursive: true });

  const AUDIO_EXTS = new Set([".mp3", ".mp4", ".m4a", ".aac", ".wav", ".flac", ".ogg", ".wma", ".opus", ".ape", ".mov", ".mkv", ".avi"]);
  const files = fs.readdirSync(input)
    .filter(f => AUDIO_EXTS.has(path.extname(f).toLowerCase()))
    .map(f => path.join(input, f));

  if (files.length === 0) {
    console.log("没有找到可转换的音视频文件");
    return;
  }

  const queue = new TaskQueue(Number(opts.parallel || 2));
  const progress = new ProgressManager(files.length);

  queue.on("error", () => {});

  let success = 0;
  let failed = 0;
  const totalStart = Date.now();
  const timings: { name: string; ms: number; ok: boolean }[] = [];

  queue.on("run", async (task: any, resolve: any, reject: any) => {
    const start = Date.now();
    const name = path.basename(task.input);
    try {
      await runFFmpeg(task.input, task.output, opts.quality);
      success++;
      timings.push({ name, ms: Date.now() - start, ok: true });
      progress.update();
      resolve(true);
    } catch (e) {
      failed++;
      timings.push({ name, ms: Date.now() - start, ok: false });
      progress.update();
      reject(e);
    }
  });

  for (const file of files) {
    const name = path.basename(file).replace(/\.[^.]+$/, "");
    queue.add({ input: file, output: path.join(output, name + ".mp3") });
  }

  return new Promise((res) => {
    const timer = setInterval(() => {
      if (progress.done === files.length) {
        clearInterval(timer);
        progress.stop();

        console.log();
        for (const t of timings) {
          const icon = t.ok ? chalk.green("✓") : chalk.red("✗");
          console.log(`  ${icon} ${t.name}  ${chalk.dim(fmt(t.ms))}`);
        }
        const total = Date.now() - totalStart;
        console.log(`\n成功 ${success}  失败 ${failed}  总耗时 ${chalk.cyan(fmt(total))}`);
        res(true);
      }
    }, 300);
  });
}
