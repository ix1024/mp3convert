"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
const events_1 = require("events");
class TaskQueue extends events_1.EventEmitter {
    constructor(concurrency) {
        super();
        this.concurrency = concurrency;
        this.queue = [];
        this.running = 0;
        this.paused = false;
    }
    add(task) {
        this.queue.push(task);
        this.next();
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
        this.next();
    }
    next() {
        if (this.paused)
            return;
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            this.run(task);
        }
    }
    async run(task) {
        this.running++;
        try {
            await new Promise((resolve, reject) => {
                this.emit("run", task, resolve, reject);
            });
            this.emit("done", task);
        }
        catch (e) {
            this.emit("error", task);
        }
        this.running--;
        this.next();
    }
}
exports.TaskQueue = TaskQueue;
