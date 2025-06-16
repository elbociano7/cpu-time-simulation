import { MemoryManagementUnit } from "../models/MemoryManagementUnit";

export abstract class PageReplacementAlgorithm {

  /**
   * Called on memory hit
   * @param mmu MemoryManagementUnit
   * @param memaddress Virtual memory address
   * @returns Hit page frame number
   */
  public abstract onHit(mmu: MemoryManagementUnit, memaddress: number): number;

  /**
   * Called on memory miss
   * @param mmu MemoryManagementUnit
   * @param memaddress Virtual memory address
   * @returns Replaced page frame number
   */
  public abstract onMiss(mmu: MemoryManagementUnit, memaddress: number): number;

  /**
   * Log helper function. Logs state of the algorithm
   */
  public abstract logState(): string;
}