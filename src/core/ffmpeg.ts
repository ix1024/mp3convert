
import { execa } from "execa";

export async function runFFmpeg(input: string, output: string, bitrate: string) {
  await execa("ffmpeg", [
    "-y",
    "-i", input,
    "-vn",
    "-map", "0:a:0",
    "-c:a", "libmp3lame",
    "-b:a", bitrate,
    output
  ]);
}
