import {Dispatcher} from "../../abstract/Dispatcher";
import {Process} from "../../abstract/Process";
import {ProcessingUnit} from "../ProcessingUnit";

export class RoundRobin extends Dispatcher {

  public queue: Process[] = [];

  public busy: boolean = false;

  public lastStartTime: number = 0;

  public quantum: number = 10;

  public addToQueue(process: Process): void {
    this.queue.push(process);
  }

  public tick(processingUnit: ProcessingUnit): void {
    const {time} = processingUnit;
    if (processingUnit.currentProcess !== null && time - this.lastStartTime >= this.quantum) {
      this.lastStartTime = time;
      processingUnit.stopProcess();
      this.busy = false;
    }
    if (!this.busy) {
      const process = this.queue.shift();
      if (process) {
        this.busy = true;
        processingUnit.runProcess(process);
        this.lastStartTime = time;
      }
    }
  }

  public dropProcess(process: Process): void {
    this.busy = false;
  }

  public stopProcess(process: Process): void {
    this.queue.push(process)
    this.busy = false;
  }

  public getQueue(): Array<Process> {
    return this.queue;
  }
}
