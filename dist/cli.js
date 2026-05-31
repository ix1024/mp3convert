"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const converter_1 = require("./core/converter");
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
function pickFolder(prompt, defaultVal) {
    try {
        const script = [
            `set f to choose folder with prompt "${prompt}" default location (POSIX file "${defaultVal}" as alias)`,
            `POSIX path of f`
        ].join("\n");
        return (0, child_process_1.execFileSync)("osascript", ["-e", script], { encoding: "utf8" }).trim();
    }
    catch {
        return defaultVal;
    }
}
function askChoice(question, choices, defaultIdx = 0) {
    const formatted = choices.map((c, i) => (i === defaultIdx ? chalk_1.default.cyan(`[${c}]`) : c)).join(" / ");
    return new Promise((resolve) => {
        rl.question(`${question} ${formatted}: `, (answer) => {
            const trimmed = answer.trim();
            const matched = choices.find(c => c.toLowerCase() === trimmed.toLowerCase());
            resolve(matched || choices[defaultIdx]);
        });
    });
}
function askNumber(question, defaultVal) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(Math.max(1, parseInt(answer.trim()) || defaultVal));
        });
    });
}
async function main() {
    console.log(chalk_1.default.bold("\n🎵 mp3convert\n"));
    console.log("选择输入目录...");
    const input = pickFolder("选择要转换的文件夹", process.cwd());
    console.log(chalk_1.default.dim(`输入: ${input}`));
    const defaultOutput = path_1.default.join(process.cwd(), "converted");
    console.log("选择输出目录...");
    const output = pickFolder("选择保存 MP3 的文件夹", defaultOutput);
    console.log(chalk_1.default.dim(`输出: ${output}`));
    const quality = await askChoice("音质", ["128k", "192k", "320k"], 1);
    const parallel = await askNumber(`并发数 (默认: ${chalk_1.default.cyan("2")}): `, 2);
    rl.close();
    console.log(chalk_1.default.dim(`\n输入: ${input}`));
    console.log(chalk_1.default.dim(`输出: ${output}`));
    console.log(chalk_1.default.dim(`音质: ${quality}  并发: ${parallel}\n`));
    await (0, converter_1.runConvert)({ input, output, quality, parallel });
}
main();
