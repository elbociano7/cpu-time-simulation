import {Process} from "../abstract/Process";
import {ProcessingUnitStatus} from "../types/ProcessingUnitStatus";
import {Logger} from "../utils/Logger";
import {ProcessingUnit} from "./ProcessingUnit";

export class Simulation {
  /**
   * Processing unit to use
   */
  public processingUnit: ProcessingUnit;

  /**
   * Time between ticks in ms
   */
  public tickTime: number;

  /**
   * Max ticks to run
   */
  public maxTicks: number;

  /**
   * Interval id
   */
  public interval: any;

  /**
   * List of processes and their arrival time
   */
  public processList: Array<{arrivalTime: number; process: Process}> = [];

  /**
   * Enable logging data to console
   */
  public enableLogging: boolean = false;

  /**
   *
   * @param processingUnit Processing unit to use
   * @param tickTime Time between ticks in ms
   * @param maxTicks Max ticks to run
   */
  public constructor(
    processingUnit: ProcessingUnit,
    tickTime: number,
    maxTicks: number = 0
  ) {
    this.processingUnit = processingUnit;
    this.tickTime = tickTime;
    this.maxTicks = maxTicks;
  }

  /**
   * Adds process to simulation. Process would arrive at the specified time.
   * @param process Process to add
   * @param arrivalTime Process arrival time
   */
  public setProcess(process: Process, arrivalTime: number): void {
    this.processList.push({arrivalTime, process});
  }

  /**
   * Runs the simulation
   */
  public run(): void {
    // If tick time is 0, run the simulation as fast as possible.
    if (this.tickTime <= 0) {
      while (true) {
        this.tick();
        if (this.maxTicks > 0 && this.processingUnit.time >= this.maxTicks) {
          break;
        }
      }
    } else {
      // Otherwise run the simulation with a fixed tick time.
      this.interval = setInterval(() => {
        this.tick();
        if (this.maxTicks > 0 && this.processingUnit.time >= this.maxTicks) {
          Logger.logHeader(`Max ticks reached: ${this.maxTicks}`);
          clearInterval(this.interval);
        }
      }, this.tickTime);
    }
  }

  public stop(): void {
    clearInterval(this.interval);
  }

  /**
   * Tick execution
   */
  public tick(): void {
    const process = this.processList[this.processingUnit.time];
    this.processList.forEach((process) => {
      if (process.arrivalTime === this.processingUnit.time) {
        this.processingUnit.addProcess(process.process);
      }
    });
    if (this.enableLogging) {
      Logger.logHeader(`Tick: ${this.processingUnit.time}`);
      Logger.setPrefix(this.processingUnit.time.toString());
    }
    const status = this.processingUnit.tick();
    if (status === ProcessingUnitStatus.IDLE) {
      this.log("Processing unit is going idle cycle");

      // Checks if:
      // 1. maxTicks is 0 (no max ticks set)
      // 2. There are no processes in the simulation stack that will arrive 
      //    after the current tick
      // 3. There are no processes in the dispatcher's queue
      if (
        this.maxTicks === 0 &&
        !this.processList.some(
          (process) => process.arrivalTime >= this.processingUnit.time
        ) &&
        this.processingUnit.dispatcher.getQueue().length === 0
      ) {
        this.maxTicks = this.processingUnit.time;
        this.log(`Stopping after ${this.maxTicks - 1} ticks`);
      }
    }
  }

  /**
   * Log if logging is enabled
   * @param message Message to log
   */
  private log(message: string) {
    if (this.enableLogging) Logger.log(message);
  }
}
