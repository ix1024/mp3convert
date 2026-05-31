
import cliProgress from "cli-progress";

export class ProgressManager {
  bar: any;
  done = 0;

  constructor(total: number) {
    this.bar = new cliProgress.SingleBar({
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
