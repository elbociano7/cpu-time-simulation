import {Dispatcher} from "../../abstract/Dispatcher";
import {Process} from "../../abstract/Process";
import {ProcessingUnit} from "../ProcessingUnit";

export class FCLS extends Dispatcher {
  
  public queue: Process[] = [];

  public busy: boolean = false;

  public addToQueue(process: Process): void {
    this.queue.push(process);
  }

  public tick(processingUnit: ProcessingUnit): void {
    if (!this.busy) {
      const process = this.queue.pop();
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
