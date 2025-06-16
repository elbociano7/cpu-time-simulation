import { ProcessRuntimeData } from "../types/ProcessRuntimeData";
import { ProcessStatus } from "../types/ProcessStatus";
import { Process } from "../abstract/Process";

/**
 * Main simulation process class
 */
export class SimulationProcess extends Process {

  /**
   * Process arival time
   */
  public startTime?: number;

  /**
   * Burst time left
   */
  public burstTime: number;

  /**
   * Total running time
   */
  public runningTime: number = 0;

  /**
   * Process finish time
   */
  public finishTime?: number;

  /**
   * Constructs a new process
   * @param burstTime Process burst time
   */
  public constructor(burstTime: number, name: string = '') {
    super(name);
    this.burstTime = burstTime;
  }

  public getBurstTimeLeft(): number {
    return this.burstTime - this.runningTime;
  }

  /** {@inheritdoc Process.run} */
  public run(runtimeData: ProcessRuntimeData): void {
    if(!this.startTime) this.startTime = runtimeData.tick;
    this.status = ProcessStatus.ACTIVE;
  }

  /** {@inheritdoc Process.tick} */
  public tick(runtimeData: ProcessRuntimeData): number|null {
    if (this.status === ProcessStatus.ACTIVE) {
      this.runningTime++;
      if(this.getBurstTimeLeft() === 0) {
        this.status = ProcessStatus.FINISHED;
        this.finishTime = runtimeData.tick;
        return 0;
      }
    } else {
      this.status = ProcessStatus.ERROR;
      return 1;
    }
    return null;
  }

  /** {@inheritdoc Process.stop} */
  public stop(runtimeData: ProcessRuntimeData): void {
    this.status = ProcessStatus.WAITING;
  }

  /**
   * Get total execution time (from start to finish)
   * @returns Execution time in ticks
   */
  public getExecutionTime(): number {
    if(this.finishTime && this.startTime) {
      return this.finishTime - this.startTime;
    }
    return 0;
  }

  /**
   * Returns a time difference between finish time and given time
   * @param tick Time to calculate relative time from
   * @returns Time difference between finish time and given time
   */
  public getRelativeTime(tick: number): number {
    if(this.finishTime) {
      return tick - this.finishTime;
    }
    return 0;
  }
}