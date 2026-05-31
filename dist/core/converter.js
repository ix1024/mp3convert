"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runConvert = runConvert;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const queue_1 = require("./queue");
const ffmpeg_1 = require("./ffmpeg");
const progress_1 = require("./progress");
function fmt(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    const s = (ms / 1000).toFixed(1);
    return `${s}s`;
}
async function runConvert(opts) {
    const input = opts.input;
    const output = opts.output || path_1.default.join(process.cwd(), "converted");
    fs_1.default.mkdirSync(output, { recursive: true });
    const AUDIO_EXTS = new Set([".mp3", ".mp4", ".m4a", ".aac", ".wav", ".flac", ".ogg", ".wma", ".opus", ".ape", ".mov", ".mkv", ".avi"]);
    const files = fs_1.default.readdirSync(input)
        .filter(f => AUDIO_EXTS.has(path_1.default.extname(f).toLowerCase()))
        .map(f => path_1.default.join(input, f));
    if (files.length === 0) {
        console.log("没有找到可转换的音视频文件");
        return;
    }
    const queue = new queue_1.TaskQueue(Number(opts.parallel || 2));
    const progress = new progress_1.ProgressManager(files.length);
    queue.on("error", () => { });
    let success = 0;
    let failed = 0;
    const totalStart = Date.now();
    const timings = [];
    queue.on("run", async (task, resolve, reject) => {
        const start = Date.now();
        const name = path_1.default.basename(task.input);
        try {
            await (0, ffmpeg_1.runFFmpeg)(task.input, task.output, opts.quality);
            success++;
            timings.push({ name, ms: Date.now() - start, ok: true });
            progress.update();
            resolve(true);
        }
        catch (e) {
            failed++;
            timings.push({ name, ms: Date.now() - start, ok: false });
            progress.update();
            reject(e);
        }
    });
    for (const file of files) {
        const name = path_1.default.basename(file).replace(/\.[^.]+$/, "");
        queue.add({ input: file, output: path_1.default.join(output, name + ".mp3") });
    }
    return new Promise((res) => {
        const timer = setInterval(() => {
            if (progress.done === files.length) {
                clearInterval(timer);
                progress.stop();
                console.log();
                for (const t of timings) {
                    const icon = t.ok ? chalk_1.default.green("✓") : chalk_1.default.red("✗");
                    console.log(`  ${icon} ${t.name}  ${chalk_1.default.dim(fmt(t.ms))}`);
                }
                const total = Date.now() - totalStart;
                console.log(`\n成功 ${success}  失败 ${failed}  总耗时 ${chalk_1.default.cyan(fmt(total))}`);
                res(true);
            }
        }, 300);
    });
}
