import {Dispatcher} from "../../abstract/Dispatcher";
import {Process} from "../../abstract/Process";
import { DispatcherError } from "../../errors/DispatcherError";
import {ProcessingUnit} from "../ProcessingUnit";

export class SJF extends Dispatcher {
  public queue: Process[] = [];

  public busy: boolean = false;

  public addToQueue(process: Process): void {
    this.queue.push(process);
  }

  public tick(processingUnit: ProcessingUnit): void {
    if (!this.busy) {
      const process = this.queue.reduce((acc: Process | null, curr: Process) => {
        if (acc === null) return curr;
        const currBurstTime = curr.hasOwnProperty("burstTime")
          ? (curr as any).burstTime
          : 0;
        const accBurstTime = acc.hasOwnProperty("burstTime")
          ? (acc as any).burstTime
          : 0;
        if (currBurstTime < accBurstTime) {
          return curr;
        }
        return acc;
      }, null as Process | null);
      if (process) {
        const index = this.queue.indexOf(process);
        if (index > -1) {
          this.queue.splice(index, 1);
        } else {
          throw new DispatcherError("Process not found in queue");
        }
      }
      if (process) {
        this.busy = true;
        processingUnit.runProcess(process);
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
