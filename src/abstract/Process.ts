import { ProcessRuntimeData } from "../types/ProcessRuntimeData";
import { ProcessStatus } from "../types/ProcessStatus";

/**
 * Abstract base class for processes
 * 
 * This class does not manage process status.
 */
export abstract class Process {

  /**
   * Process status
   * if current process is selected for execution:
   * - `WAITING`, start method would be called before next tick,
   * - `ACTIVE`, only tick would be called,
   * - `FINISHED`, stop method would be called after tick and the process would
   * be removed from the simulation stack.
   */
  public status: ProcessStatus = ProcessStatus.WAITING;

  /** Process name */
  public name: string = '';

  /**
   * Constructs a new process
   */
  public constructor(name: string = '') {
    this.name = name;
  }
  
  /**
   * Method called on process start
   * @param runtimeData Runtime data of the process
   */
  public abstract run(runtimeData: ProcessRuntimeData): void;
 
  /**
   * Tick method. Called on every simulation tick if the process is currently
   * active.
   * @param runtimeData Runtime data of the process
   */
  public abstract tick(runtimeData: ProcessRuntimeData): number|null;

  /**
   * Method called on process stop
   * @param runtimeData Runtime data of the process
   */
  public abstract stop(runtimeData: ProcessRuntimeData): void;
  
}