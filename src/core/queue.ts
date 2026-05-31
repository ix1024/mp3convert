import { EventEmitter } from "events";

export class TaskQueue extends EventEmitter {
  private queue: any[] = [];
  private running = 0;
  private paused = false;

  constructor(private concurrency: number) {
    super();
  }

  add(task: any) {
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

  private next() {
    if (this.paused) return;

    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      this.run(task);
    }
  }

  private async run(task: any) {
    this.running++;

    try {
      await new Promise((resolve, reject) => {
        this.emit("run", task, resolve, reject);
      });

      this.emit("done", task);
    } catch (e) {
      this.emit("error", task);
    }

    this.running--;
    this.next();
  }
}
