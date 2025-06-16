import { ProcessingUnit } from "../models/ProcessingUnit";
import { Process } from "./Process";

export abstract class Dispatcher {
  
  /**
   * Adds a process to the queue
   * @param process Process to add to the queue
   */
  public abstract addToQueue(process: Process): void;

  /**
   * Function to be called on each tick
   * @param processingUnit Processing unit that invoked the tick
   */
  public abstract tick(processingUnit: ProcessingUnit): void;
  
  /**
   * Called on process drop
   * @param process Process to drop
   */
  public abstract dropProcess(process: Process): void;

  /**
   * Called on process stop
   * @param process Process to stop
   */
  public abstract stopProcess(process: Process): void;

  /**
   * Returns the actual processqueue
   */
  public abstract getQueue(): Array<Process>;
}