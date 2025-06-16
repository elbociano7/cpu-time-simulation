import {Dispatcher} from "../abstract/Dispatcher";
import {PageReplacementAlgorithm} from "../abstract/PageReplacementAlgorithm";
import {Process} from "../abstract/Process";
import {ProcessingUnitError} from "../errors/ProcessingUnitError";
import {ProcessingUnitStatus} from "../types/ProcessingUnitStatus";
import {ProcessRuntimeData} from "../types/ProcessRuntimeData";
import {Logger} from "../utils/Logger";
import {CopyBlock} from "../utils/MemoryHelper";
import {Memory} from "./Memory";
import {Storage} from "./Storage";
import {MemoryManagementUnit} from "./MemoryManagementUnit";

export class ProcessingUnit {
  /**
   * Current simulation tick
   */
  public time: number = 0;

  /**
   * Dispatcher to use
   */
  public dispatcher: Dispatcher;

  public pra: PageReplacementAlgorithm;

  public mmu: MemoryManagementUnit;

  public memory: Memory;

  public storage: Storage;

  public readQueue: Array<
    number | {address: number; handler: (data: number) => void}
  > = [];

  public hits: Array<number> = [];

  public misses: Array<number> = [];

  public lastRead?: number;

  /**
   * Currently running process
   */
  public currentProcess: Process | null = null;

  /**
   * Enable logging data to console
   */
  public enableLogging: boolean = false;

  /**
   * Custom handler for tick event
   */
  public onTick = (pu: ProcessingUnit): any => {};

  /**
   * Called on process end (when process return 0)
   * @param process Process that ended
   */
  public onProcessEnd = (process: Process, pu: ProcessingUnit): any => {};

  /**
   * Constructs a new processing unit
   * @param dispatcher Dispatcher to use
   * @param pra Page replacement algorithm
   * @param mmu Memory management unit
   * @param memory Memory
   * @param storage Storage
   */
  public constructor(
    dispatcher: Dispatcher,
    pra: PageReplacementAlgorithm,
    mmu: MemoryManagementUnit,
    memory: Memory,
    storage: Storage
  ) {
    this.dispatcher = dispatcher;
    this.pra = pra;
    this.mmu = mmu;
    this.memory = memory;
    this.storage = storage;
  }

  /**
   * Runs a new process
   * @param process Process to run
   * @throws ProcessingUnitError if another process is already running
   */
  public runProcess(process: Process): void {
    if (this.enableLogging) Logger.log(`Running process: '${process.name}'`);
    if (this.currentProcess !== null) {
      throw new ProcessingUnitError("Another process is already running");
    }
    this.currentProcess = process;
    this.currentProcess.run(this.getRuntimeData());
  }

  /**
   * Stops the currently running process
   * @throws ProcessingUnitError if no process is currently running
   */
  public stopProcess(): void {
    if (this.enableLogging)
      Logger.log(`Stopping process: ${this.currentProcess?.name}`);
    if (this.currentProcess === null) {
      throw new ProcessingUnitError("Attempted to stop null process");
    }
    this.currentProcess?.stop(this.getRuntimeData());
    this.dispatcher.stopProcess(this.currentProcess);
    this.currentProcess = null;
  }

  /**
   * Drops the currently running process
   * @throws ProcessingUnitError if no process is currently running
   */
  public dropProcess(): void {
    if (this.enableLogging)
      Logger.log(`Dropping process: '${this.currentProcess?.name}'`);
    if (this.currentProcess === null) {
      throw new ProcessingUnitError("Attempted to drop null process");
    }
    this.dispatcher.dropProcess(this.currentProcess);
    this.currentProcess = null;
  }

  /**
   * Adds a process to the queue
   * @param process Process to add
   */
  public addProcess(process: Process): void {
    this.dispatcher.addToQueue(process);
  }

  /**
   * Attempts to read data from the memory.
   *
   * If the data is not in the memory, it will call `replacePage` with page
   * number from `PageReplacementAlgorithm.onMiss()` and read the data from
   * the new page.
   *
   * @param address Virtual memory address to read
   * @param handler Optional handler to be called on read
   */
  public readData(
    address: number,
    handler: (data: number) => void = () => {}
  ): void {
    const translatedAddress = this.mmu.translate(address);
    if (translatedAddress === false) {
      const frame = this.pra.onMiss(this.mmu, address);
      this.log(
        `Memory miss at address {yellow-fg}0x${address.toString(
          16
        )}{/yellow-fg}; frame: {yellow-fg}${frame}{/yellow-fg}`
      );
      const newAddress = this.replaceFrame(frame, address);
      handler(this.memory.read(newAddress));
      this.misses.push(address);
    } else {
      handler(this.memory.read(translatedAddress));
      const frame = this.pra.onHit(this.mmu, address);
      this.log(
        `Memory hit at address {green-fg}0x${address.toString(
          16
        )}{/green-fg}; frame: {green-fg}${frame}{/green-fg}`
      );
      this.hits.push(address);
    }
    this.lastRead = address;
  }

  /**
   * Replaces a page in the memory with the data from the page that contains
   * the data.
   *
   * @param replacedFrame Frame to be replaced
   * @param dataAddress Address in virtual memory that contains needed data
   * @returns New data address in physical memory
   */
  public replaceFrame(replacedFrame: number, dataAddress: number): number {
    const {page, offset} = this.mmu.pageTable.getPageAddress(dataAddress);
    this.mmu.pageTable.assignPageToFrame(page, replacedFrame);
    const frameSize = this.mmu.pageTable.frameSize;
    CopyBlock(
      this.storage.data,
      this.memory.memory,
      page * frameSize,
      replacedFrame * frameSize,
      frameSize
    );
    return replacedFrame * frameSize + offset;
  }

  /**
   * Ticks the simulation
   * @returns PU status code
   */
  public tick(): ProcessingUnitStatus {
    this.lastRead = undefined;
    if (this.readQueue.length > 0) {
      const object = this.readQueue.shift();
      if (typeof object === "object") {
        this.readData(object.address, object.handler);
      } else {
        this.readData(object as number);
      }
    }
    this.dispatcher.tick(this);
    this.time++;
    this.onTick(this);
    if (!this.currentProcess) return ProcessingUnitStatus.IDLE;
    this.log(`Ticking process: '${this.currentProcess.name}'`);
    const result = this.currentProcess.tick(this.getRuntimeData());
    if (result !== null) {
      this.log(
        `Process: '${this.currentProcess?.name}' returned with code ${result}`
      );
    }
    if (result === 0) {
      this.dispatcher.dropProcess(this.currentProcess);
      this.onProcessEnd(this.currentProcess, this);
      this.dropProcess();
    }

    return ProcessingUnitStatus.BUSY;
  }

  /**
   * Generates runtime data for the current tick
   * @returns Runtime data for the current tick
   */
  private getRuntimeData(): ProcessRuntimeData {
    return {
      tick: this.time,
    };
  }

  /**
   * Log if logging is enabled
   * @param message Message to log
   */
  private log(message: string) {
    if (this.enableLogging) {
      Logger.log(message);
    }
  }
}
