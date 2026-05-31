"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressManager = void 0;
const cli_progress_1 = __importDefault(require("cli-progress"));
class ProgressManager {
    constructor(total) {
        this.done = 0;
        this.bar = new cli_progress_1.default.SingleBar({
            format: "进度 |{bar}| {value}/{total} | {percentage}%"
        });
        this.bar.start(total, 0);
    }
    update() {
        this.done++;
        this.bar.update(this.done);
    }
    stop() {
        this.bar.stop();
    }
}
exports.ProgressManager = ProgressManager;
