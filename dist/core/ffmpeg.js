"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFFmpeg = runFFmpeg;
const execa_1 = require("execa");
async function runFFmpeg(input, output, bitrate) {
    await (0, execa_1.execa)("ffmpeg", [
        "-y",
        "-i", input,
        "-vn",
        "-map", "0:a:0",
        "-c:a", "libmp3lame",
        "-b:a", bitrate,
        output
    ]);
}
